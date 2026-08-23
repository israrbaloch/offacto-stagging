<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    /**
     * Switch the active company for the authenticated user.
     *
     * @param Request $request
     * @param Company $company
     * @return JsonResponse|RedirectResponse
     */
    public function switchCompany(Request $request, Company $company): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        // Validate that the company belongs to the authenticated user
        if (!$user->companies()->where('id', $company->id)->exists()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Company not found or access denied.',
                    'errors' => ['company' => ['You do not have access to this company.']],
                ], 403);
            }
            return redirect()->back()->with('error', 'Company not found or access denied.');
        }

        // Set the active company in session
        $user->setActiveCompanyId($company->id);

        // Get company settings for theme colors
        $companySettings = $company->companySetting;
        $theme = $companySettings?->theme ?? ['primary' => '#4054B2', 'secondary' => '#454545'];
        
        // Ensure theme is an array
        if (is_string($theme)) {
            $theme = json_decode($theme, true) ?? ['primary' => '#4054B2', 'secondary' => '#454545'];
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Company switched successfully.',
                'data' => [
                    'company_id' => $company->id,
                    'company_name' => $company->company_name,
                    'logo_url' => $companySettings?->invoice_logo 
                        ? asset('storage/' . $companySettings->invoice_logo) 
                        : asset('images/no-image.svg'),
                    'theme' => $theme,
                ],
            ]);
        }

        return redirect()->back()->with('status', 'company-switched');
    }
}
