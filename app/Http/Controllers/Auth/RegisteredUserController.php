<?php

namespace App\Http\Controllers\Auth;

use App\Mail\Admin\NewUserRegistered;
use App\Mail\Admin\CompanyPendingApproval;
use App\Mail\CompanySubmittedConfirmation;
use App\Mail\WelcomeEmail;
use App\Models\Company;
use App\Models\Role;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Models\User;
use App\Http\Requests\StoreRegistrationWithCompanyRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
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

        $languages = \App\Models\Language::orderBy('name')->pluck('name', 'id');
        return Inertia::render('Auth/Register', [
            'languages' => $languages,
        ]);
    }

    public function store(StoreRegistrationWithCompanyRequest $request): RedirectResponse
    {
        if (!SiteSetting::getBoolean('allow_user_registration', true)) {
            return redirect()->route('login')->with('error', 'User registration is currently disabled.');
        }

        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        $role = Role::where('name', 'staff')->first();
        $user->roles()->attach($role);

        event(new Registered($user));

        $companyData = [
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'first_name' => $data['first_name'],
            'surname' => $data['surname'],
            'email' => $data['email_company'],
            'phone' => $data['phone'],
            'vat_number' => $data['vat_number'] ?? '',
            'street' => $data['street'],
            'house' => $data['house'],
            'postal_code' => $data['postal_code'],
            'city' => $data['city'],
            'language' => $data['language'],
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

        if (SiteSetting::getBoolean('send_welcome_email', true)) {
            Mail::to($user->email)->send(new WelcomeEmail($user));
        }

        $adminEmail = SiteSetting::get('admin_email');
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new NewUserRegistered($user, true));
        }

        if ($requiresApproval) {
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new CompanyPendingApproval($company));
            }
            Mail::to($user->email)->send(new CompanySubmittedConfirmation($company));
            return redirect()->route('login')
                ->with('status', 'Registration successful. Your company is pending approval. You will receive an email when it is approved.');
        }

        $user->setActiveCompanyId($company->id);
        Auth::login($user);
        return redirect(route('dashboard', absolute: false));
    }
}
