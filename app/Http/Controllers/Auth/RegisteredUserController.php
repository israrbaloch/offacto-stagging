<?php

namespace App\Http\Controllers\Auth;

use App\Mail\Admin\NewUserRegistered;
use App\Mail\Admin\CompanyPendingApproval;
use App\Mail\CompanySubmittedConfirmation;
use App\Models\Company;
use App\Models\CompanyLegalDocument;
use App\Models\Language;
use App\Models\Role;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Models\User;
use App\Http\Requests\StoreRegistrationWithCompanyRequest;
use App\Http\Controllers\Controller;
use App\Services\ViesValidationService;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;

class RegisteredUserController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (!SiteSetting::getBoolean('allow_user_registration', true)) {
            return redirect()->route('login')->with('error', 'User registration is currently disabled.');
        }

        $languages = Language::orderBy('name')->pluck('name', 'id');

        return Inertia::render('Auth/Register', [
            'languages' => $languages,
            'brandSwatches' => ['#3A4AA0', '#0F766E', '#B4235A', '#C2410C', '#141A3A'],
        ]);
    }

    public function store(StoreRegistrationWithCompanyRequest $request, ViesValidationService $vies): RedirectResponse
    {
        if (!SiteSetting::getBoolean('allow_user_registration', true)) {
            return redirect()->route('login')->with('error', 'User registration is currently disabled.');
        }

        try {
            $viesResult = $vies->validate($request->string('vat_number')->toString());
        } catch (ValidationException $e) {
            throw $e;
        }

        if (! $viesResult['valid']) {
            throw ValidationException::withMessages([
                'vat_number' => [__('customers.vies_not_registered')],
            ]);
        }

        $data = $request->validated();
        $data['vat_number'] = $viesResult['vat_number'];

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        $role = Role::where('name', 'staff')->first();
        if ($role) {
            $user->roles()->attach($role);
        }

        event(new Registered($user));

        $languageId = $data['language']
            ?? Language::query()->where('code', app()->getLocale())->value('id')
            ?? Language::query()->orderBy('id')->value('id');

        $companyEmail = $data['email_company'] ?? $data['email'];
        $phone = filled($data['phone'] ?? null) ? $data['phone'] : 'reg-'.$user->id;

        $companyData = [
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'legal_form' => $data['legal_form'],
            'vat_regime' => $data['vat_regime'],
            'first_name' => $data['first_name'],
            'surname' => $data['surname'],
            'email' => $companyEmail,
            'phone' => $phone,
            'vat_number' => $data['vat_number'],
            'street' => $data['street'] ?? '',
            'house' => $data['house'] ?? '',
            'postal_code' => $data['postal_code'] ?? '',
            'city' => $data['city'] ?? '',
            'language' => $languageId,
            'self_employed_activity' => $data['self_employed_activity'] ?? null,
        ];

        $requiresApproval = SiteSetting::getBoolean('require_company_approval', false);
        if ($requiresApproval) {
            $pendingStatus = Status::forTable('companies')->where('name', 'Pending Approval')->first();
            if ($pendingStatus) {
                $companyData['status'] = $pendingStatus->id;
                $companyData['is_active'] = false;
            }
        } else {
            $approvedStatus = Status::forTable('companies')->where('name', 'Approved')->first();
            if ($approvedStatus) {
                $companyData['status'] = $approvedStatus->id;
                $companyData['is_active'] = true;
            }
        }

        $company = Company::create($companyData);
        $company->ensureDefaults();

        $this->applyRegistrationBranding($request, $company, $data['theme_primary'] ?? null);
        $this->storeRegistrationLegalDocuments($request, $company);

        $adminEmail = SiteSetting::get('admin_email');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new NewUserRegistered($user, true));
        }

        if ($requiresApproval) {
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new CompanyPendingApproval($company));
            }
            Mail::to($user->email)->send(new CompanySubmittedConfirmation($company));

            return RegisterEmailVerificationController::beginVerification($request, $user);
        }

        $user->setActiveCompanyId($company->id);

        return RegisterEmailVerificationController::beginVerification($request, $user);
    }

    private function applyRegistrationBranding(StoreRegistrationWithCompanyRequest $request, Company $company, ?string $themePrimary): void
    {
        $settings = $company->companySetting;
        if (! $settings) {
            return;
        }

        $theme = $settings->theme ?? ['primary' => '#4054b2', 'secondary' => '#0f172a'];
        if ($themePrimary) {
            $theme['primary'] = $themePrimary;
        }

        $updates = ['theme' => $theme];

        if ($request->hasFile('invoice_logo')) {
            $path = $request->file('invoice_logo')->store('logos', 'public');
            $updates['invoice_logo'] = $path;
        }

        $settings->update($updates);
    }

    private function storeRegistrationLegalDocuments(StoreRegistrationWithCompanyRequest $request, Company $company): void
    {
        $map = [
            'legal_document_privacy' => ['type' => 'privacy', 'title_key' => 'auth.legal_doc_privacy'],
            'legal_document_terms' => ['type' => 'terms', 'title_key' => 'profile.terms'],
            'legal_document_dpa' => ['type' => 'dpa', 'title_key' => 'auth.legal_doc_dpa'],
            'legal_document_other' => ['type' => 'other', 'title_key' => 'profile.other'],
        ];

        foreach ($map as $field => $meta) {
            if (! $request->hasFile($field)) {
                continue;
            }

            $file = $request->file($field);
            $path = $file->store('legal/'.$company->id, 'public');

            CompanyLegalDocument::create([
                'company_id' => $company->id,
                'type' => $meta['type'],
                'title' => trans($meta['title_key']),
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'attach_to_quotes_default' => in_array($meta['type'], ['terms', 'dpa'], true),
            ]);
        }
    }
}
