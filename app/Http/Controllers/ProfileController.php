<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Requests\UpdateCompanySettingsRequest;
use App\Mail\Admin\CompanyPendingApproval;
use App\Mail\CompanySubmittedConfirmation;
use App\Services\EmailOtpService;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Support\PublicStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $company = $user->activeCompany();

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'hasCompany' => (bool) $company,
        ]);
    }

    public function sendPasswordReset(Request $request): RedirectResponse
    {
        $user = $request->user();
        app(EmailOtpService::class)->issue($user, EmailOtpService::PURPOSE_PASSWORD_RESET);

        return back()->with('status', 'password-reset-sent');
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Profile updated successfully.',
                'data' => $user->only(['name', 'email']),
            ]);
        }

        return back()->with('status', 'profile-updated');
    }

    public function updateCompany(UpdateCompanyRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $company = $user->activeCompany();

        if (! $company) {
            $companyData = [
                'user_id' => $user->id,
                ...$request->validated(),
            ];

            if (SiteSetting::getBoolean('require_company_approval', false)) {
                $pendingStatus = Status::forTable('companies')->where('name', 'Pending Approval')->first();
                if ($pendingStatus) {
                    $companyData['status'] = $pendingStatus->id;
                    $companyData['is_active'] = false;
                }
            }

            $company = Company::create($companyData);

            if (SiteSetting::getBoolean('require_company_approval', false)) {
                $adminEmail = SiteSetting::get('admin_email');
                if ($adminEmail) {
                    Mail::to($adminEmail)->send(new CompanyPendingApproval($company));
                }
                Mail::to($user->email)->send(new CompanySubmittedConfirmation($company));
            }
        } else {
            $company->update($request->validated());
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Company information updated successfully.',
                'data' => $company->toArray(),
            ]);
        }

        return back()->with('status', 'company-updated');
    }

    public function updateCompanySettings(UpdateCompanySettingsRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $company = $user->activeCompany();

        if (! $company) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Company not found. Please create a company first.',
                    'errors' => ['company' => ['Company not found.']],
                ], 422);
            }

            return back()->with('error', 'Company not found. Please create a company first.');
        }

        $companySettings = $company->companySetting;

        if (! $companySettings) {
            $company->ensureDefaults();
            $companySettings = $company->fresh()->companySetting;
        }

        if (! $companySettings) {
            return back()->with('error', 'Could not save branding settings for this company.');
        }

        $data = $request->validated();
        if ($request->has('logo_in_emails')) {
            $data['logo_in_emails'] = $request->boolean('logo_in_emails');
        }

        if ($request->hasFile('invoice_logo')) {
            if ($companySettings->invoice_logo) {
                Storage::disk('public')->delete($companySettings->invoice_logo);
            }

            $path = $request->file('invoice_logo')->store('logos', 'public');
            $data['invoice_logo'] = $path;
        } else {
            unset($data['invoice_logo']);
        }

        if (isset($data['theme'])) {
            if (empty($data['theme']['primary']) || empty($data['theme']['secondary'])) {
                $data['theme'] = null;
            }
        }

        $companySettings->update($data);
        $companySettings->refresh();

        if ($request->expectsJson()) {
            $responseData = $companySettings->toArray();
            if (! empty($responseData['invoice_logo'])) {
                $responseData['invoice_logo_url'] = PublicStorage::url($responseData['invoice_logo']);
            }

            return response()->json([
                'message' => 'Company settings updated successfully.',
                'data' => $responseData,
            ]);
        }

        return back()->with('status', 'company-settings-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
