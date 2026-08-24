<?php

use App\Http\Controllers\Admin\AdminCompanyController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BriefingController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\PublicBriefingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/b/{token}', [PublicBriefingController::class, 'show'])->name('briefings.public');
Route::post('/b/{token}', [PublicBriefingController::class, 'submit'])->name('briefings.public.submit');

Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware('auth');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/company', [ProfileController::class, 'updateCompany'])->name('profile.company.update');
    Route::patch('/profile/company-settings', [ProfileController::class, 'updateCompanySettings'])->name('profile.company-settings.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/legal-documents', [ProfileController::class, 'storeLegalDocument'])->name('profile.legal.store');
    Route::patch('/profile/legal-documents/{document}', [ProfileController::class, 'updateLegalDocument'])->name('profile.legal.update');
    Route::delete('/profile/legal-documents/{document}', [ProfileController::class, 'destroyLegalDocument'])->name('profile.legal.destroy');

    Route::get('/support', fn () => Inertia::render('Support'))->name('support');
    Route::get('/settings', [ProfileController::class, 'edit'])->name('settings');
    Route::post('/profile/password-reset', [ProfileController::class, 'sendPasswordReset'])->name('profile.password-reset');
    
    // Company switching
    Route::post('/company/switch/{company}', [CompanyController::class, 'switchCompany'])->name('company.switch');

    // User's companies (list and add)
    Route::get('/companies', [UserCompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/create', [UserCompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies', [UserCompanyController::class, 'store'])->name('companies.store');
    
    // Services
    Route::resource('services', ServiceController::class);
    
    // Customers
    Route::resource('customers', CustomerController::class);
    
    Route::get('briefings', [BriefingController::class, 'index'])->name('briefings.index');
    Route::get('briefings/create', [BriefingController::class, 'create'])->name('briefings.create');
    Route::get('briefings/{briefing}/edit', [BriefingController::class, 'edit'])->name('briefings.edit');
    Route::put('briefings/{briefing}', [BriefingController::class, 'update'])->name('briefings.update');
    Route::delete('briefings/{briefing}', [BriefingController::class, 'destroy'])->name('briefings.destroy');
    Route::get('briefings/{briefing}/responses', [BriefingController::class, 'responses'])->name('briefings.responses');

    // Offers
    Route::resource('offers', OfferController::class);
    Route::post('offers/{offer}/send', [OfferController::class, 'send'])->name('offers.send');
    Route::post('offers/{offer}/attachments', [OfferController::class, 'storeAttachment'])->name('offers.attachments.store');
    Route::delete('offers/{offer}/attachments/{attachment}', [OfferController::class, 'destroyAttachment'])->name('offers.attachments.destroy');
    Route::get('offers/{offer}/preview', [OfferController::class, 'preview'])->name('offers.preview');
    Route::get('offers/{offer}/download', [OfferController::class, 'download'])->name('offers.download');
    
    // Invoices
    Route::get('invoices/from-offer/{offer}', [InvoiceController::class, 'createFromOffer'])->name('invoices.from-offer');
    Route::resource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');
    Route::get('invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('invoices.download');
    Route::get('invoices/{invoice}/ubl', [InvoiceController::class, 'downloadUbl'])->name('invoices.ubl');
    Route::post('invoices/{invoice}/payment', [InvoiceController::class, 'recordPayment'])->name('invoices.payment');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Users Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::post('/users/{user}/assign-role', [AdminUserController::class, 'assignRole'])->name('users.assign-role');
    
    // Companies Management
    Route::get('/companies', [AdminCompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/{company}', [AdminCompanyController::class, 'show'])->name('companies.show');
    Route::get('/companies/{company}/edit', [AdminCompanyController::class, 'edit'])->name('companies.edit');
    Route::patch('/companies/{company}', [AdminCompanyController::class, 'update'])->name('companies.update');
    Route::post('/companies/{company}/approve', [AdminCompanyController::class, 'approve'])->name('companies.approve');
    Route::post('/companies/{company}/reject', [AdminCompanyController::class, 'reject'])->name('companies.reject');
    Route::post('/companies/{company}/toggle-active', [AdminCompanyController::class, 'toggleActive'])->name('companies.toggle-active');
    
    // Services Management
    Route::get('/services', [AdminServiceController::class, 'index'])->name('services.index');
    Route::get('/services/{service}', [AdminServiceController::class, 'show'])->name('services.show');
    Route::get('/services/{service}/edit', [AdminServiceController::class, 'edit'])->name('services.edit');
    Route::patch('/services/{service}', [AdminServiceController::class, 'update'])->name('services.update');
    Route::post('/services/{service}/approve', [AdminServiceController::class, 'approve'])->name('services.approve');
    Route::post('/services/{service}/reject', [AdminServiceController::class, 'reject'])->name('services.reject');

    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
});

// Staff-only routes
Route::middleware(['auth', 'role:staff'])->group(function () {
    Route::get('/staff', function () {
        return Inertia::render('Staff/Dashboard');
    })->name('staff.dashboard');
});

// Routes accessible by both admin and staff
Route::middleware(['auth', 'role:admin|staff'])->group(function () {
    Route::get('/reports', function () {
        return 'Reports';
    })->middleware('permission:view-reports')->name('reports');
});

require __DIR__.'/auth.php';
