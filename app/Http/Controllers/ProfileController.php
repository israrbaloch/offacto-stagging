<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Requests\UpdateCompanySettingsRequest;
use App\Mail\Admin\CompanyPendingApproval;
use App\Mail\CompanySubmittedConfirmation;
use App\Models\Company;
use App\Models\CompanySetting;
use App\Models\Language;
use App\Models\NumberingSeries;
use App\Models\SiteSetting;
use App\Models\Status;
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
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $company = $user->activeCompany();
        $companySettings = $company?->companySetting;
        
        // Create company settings if it doesn't exist
        if ($company && !$companySettings) {
            $companySettings = CompanySetting::create([
                'company_id' => $company->id,
                'numbering_series' => $company->numberingSeries()->first()?->id ?? 1,
            ]);
        }

        // Get numbering series for the company
        $numberingSeries = $company 
            ? NumberingSeries::where('company_id', $company->id)->get()->pluck('name', 'id')
            : collect();

        // Get languages for dropdown
        $languages = Language::all()->pluck('name', 'id');

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'company' => $company,
            'companySettings' => $companySettings,
            'numberingSeries' => $numberingSeries,
            'languages' => $languages,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Handle password update
        if (!empty($data['password'])) {
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

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Update the company information.
     */
    public function updateCompany(UpdateCompanyRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $company = $user->activeCompany();

        if (!$company) {
            // Create company if it doesn't exist
            $companyData = [
                'user_id' => $user->id,
                ...$request->validated(),
            ];
            
            // Check if company approval is required
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

        return Redirect::route('profile.edit')->with('status', 'company-updated');
    }

    /**
     * Update the company settings.
     */
    public function updateCompanySettings(UpdateCompanySettingsRequest $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $company = $user->activeCompany();

        if (!$company) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Company not found. Please create a company first.',
                    'errors' => ['company' => ['Company not found.']],
                ], 422);
            }
            return Redirect::route('profile.edit')->with('error', 'Company not found. Please create a company first.');
        }

        $companySettings = $company->companySetting;

        if (!$companySettings) {
            $companySettings = CompanySetting::create([
                'company_id' => $company->id,
                'numbering_series' => $request->validated()['numbering_series'],
            ]);
        }

        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('invoice_logo')) {
            // Delete old logo if exists
            if ($companySettings->invoice_logo) {
                Storage::disk('public')->delete($companySettings->invoice_logo);
            }

            $path = $request->file('invoice_logo')->store('logos', 'public');
            $data['invoice_logo'] = $path;
        } else {
            unset($data['invoice_logo']);
        }

        // Handle theme - if primary or secondary is empty, set theme to null (default colors)
        // The model's 'array' cast will handle JSON encoding/decoding automatically
        if (isset($data['theme'])) {
            if (empty($data['theme']['primary']) || empty($data['theme']['secondary'])) {
                $data['theme'] = null;
            }
            // If theme has values, keep it as array - the model cast will handle JSON encoding
        }

        $companySettings->update($data);
        
        // Refresh the model to get updated data
        $companySettings->refresh();

        if ($request->expectsJson()) {
            $responseData = $companySettings->toArray();
            // Add full URL for logo if it exists
            if (!empty($responseData['invoice_logo'])) {
                $responseData['invoice_logo_url'] = asset('storage/' . $responseData['invoice_logo']);
            }
            
            return response()->json([
                'message' => 'Company settings updated successfully.',
                'data' => $responseData,
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'company-settings-updated');
    }

    /**
     * Delete the user's account.
     */
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
