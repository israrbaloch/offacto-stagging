<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyRequest;
use App\Mail\Admin\CompanyPendingApproval;
use App\Mail\CompanySubmittedConfirmation;
use App\Models\Company;
use App\Models\Language;
use App\Models\SiteSetting;
use App\Models\Status;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class UserCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $companies = $user->companies()->with('statusRelation')->latest()->get();
        return Inertia::render('Companies/Index', [
            'companies' => $companies,
            'requireCompanyApproval' => SiteSetting::getBoolean('require_company_approval', false),
        ]);
    }

    public function create(Request $request): Response
    {
        $languages = Language::orderBy('name')->pluck('name', 'id');
        return Inertia::render('Companies/Create', [
            'languages' => $languages,
            'requireCompanyApproval' => SiteSetting::getBoolean('require_company_approval', false),
        ]);
    }

    public function store(StoreCompanyRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $companyData = [
            'user_id' => $user->id,
            'company_name' => $data['company_name'],
            'first_name' => $data['first_name'],
            'surname' => $data['surname'],
            'email' => $data['email'],
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

        if ($requiresApproval) {
            $adminEmail = SiteSetting::get('admin_email');
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new CompanyPendingApproval($company));
            }
            Mail::to($user->email)->send(new CompanySubmittedConfirmation($company));
            return redirect()->route('companies.index')
                ->with('status', 'Company submitted for approval. You will receive an email when it is approved.');
        }

        return redirect()->route('companies.index')->with('status', 'company-created');
    }
}
