<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BriefingController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\MolliePaymentReturnController;
use App\Http\Controllers\MollieWebhookController;
use App\Http\Controllers\PublicBriefingController;
use App\Http\Controllers\PublicOfferController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NumberingSeriesController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UpgradeController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/b/{token}', [PublicBriefingController::class, 'show'])->name('briefings.public');
Route::post('/b/{token}', [PublicBriefingController::class, 'submit'])->name('briefings.public.submit');

Route::get('/q/{token}', [PublicOfferController::class, 'show'])->name('offers.public');
Route::post('/q/{token}/accept', [PublicOfferController::class, 'accept'])->name('offers.public.accept');
Route::post('/q/{token}/decline', [PublicOfferController::class, 'decline'])->name('offers.public.decline');
Route::get('/q/{token}/preview', [PublicOfferController::class, 'preview'])->name('offers.public.preview');
Route::get('/q/{token}/download', [PublicOfferController::class, 'download'])->name('offers.public.download');

Route::post('/webhooks/mollie', MollieWebhookController::class)->name('webhooks.mollie');
Route::get('/payment/mollie/return', MolliePaymentReturnController::class)->name('payments.mollie.return');

Route::post('/locale', function (\Illuminate\Http\Request $request) {
    $locale = $request->validate([
        'locale' => ['required', 'in:en,fr,nl'],
    ])['locale'];
    $request->session()->put('locale', $locale);
    app()->setLocale($locale);

    return back();
})->name('locale.update');

Route::get('/', function () {
    if (auth()->user()?->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('dashboard');
})->middleware('auth');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified.email', 'redirect.admin'])
    ->name('dashboard');

Route::get('/search', SearchController::class)
    ->middleware(['auth', 'verified.email', 'redirect.admin'])
    ->name('search');

Route::middleware(['auth', 'verified.email', 'redirect.admin'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/company', [ProfileController::class, 'updateCompany'])->name('profile.company.update');
    Route::patch('/profile/company-settings', [ProfileController::class, 'updateCompanySettings'])->name('profile.company-settings.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/legal-documents', [ProfileController::class, 'storeLegalDocument'])->name('profile.legal.store');
    Route::patch('/profile/legal-documents/{document}', [ProfileController::class, 'updateLegalDocument'])->name('profile.legal.update');
    Route::delete('/profile/legal-documents/{document}', [ProfileController::class, 'destroyLegalDocument'])->name('profile.legal.destroy');

    Route::get('/support', fn () => Inertia::render('Support'))->name('support');
    Route::get('/upgrade', [UpgradeController::class, 'index'])->name('upgrade');
    Route::post('/upgrade', [UpgradeController::class, 'store'])->name('upgrade.store');
    Route::get('/upgrade/callback', [UpgradeController::class, 'callback'])->name('upgrade.callback');
    Route::post('/subscription/reminder/dismiss', [\App\Http\Controllers\SubscriptionController::class, 'dismissReminder'])->name('subscription.reminder.dismiss');
    Route::patch('/subscription/reminders', [\App\Http\Controllers\SubscriptionController::class, 'updateReminders'])->name('subscription.reminders.update');
    Route::post('/subscription/cancel', [\App\Http\Controllers\SubscriptionController::class, 'cancel'])->name('subscription.cancel');

    Route::post('/profile/numbering-series', [NumberingSeriesController::class, 'store'])->name('profile.numbering-series.store');
    Route::patch('/profile/numbering-series/{series}', [NumberingSeriesController::class, 'update'])->name('profile.numbering-series.update');
    Route::delete('/profile/numbering-series/{series}', [NumberingSeriesController::class, 'destroy'])->name('profile.numbering-series.destroy');
    Route::post('/profile/numbering-series/{series}/default', [NumberingSeriesController::class, 'setDefault'])->name('profile.numbering-series.default');
    Route::post('/profile/password-reset', [ProfileController::class, 'sendPasswordReset'])->name('profile.password-reset');
    Route::patch('/profile/integrations', [\App\Http\Controllers\CompanyIntegrationsController::class, 'update'])->name('profile.integrations.update');
    Route::post('/profile/integrations/postbode/test', [\App\Http\Controllers\CompanyIntegrationsController::class, 'testPostbode'])->name('profile.integrations.postbode.test');

    Route::post('/theme', function (\Illuminate\Http\Request $request) {
        $theme = $request->validate([
            'theme' => ['required', 'in:light,dark'],
        ])['theme'];
        $request->session()->put('appearance', $theme);

        return back();
    })->name('theme.update');
    
    // Company switching
    Route::post('/company/switch/{company}', [CompanyController::class, 'switchCompany'])->name('company.switch');
    Route::post('/company/clear-workspace', [CompanyController::class, 'clearWorkspace'])->name('company.clear');

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
    Route::post('briefings/{briefing}/responses/{response}/generate-quote', [BriefingController::class, 'generateQuote'])->name('briefings.responses.generate-quote');
    Route::post('briefings/{briefing}/duplicate', [BriefingController::class, 'duplicate'])->name('briefings.duplicate');
    Route::post('briefings/{briefing}/archive', [BriefingController::class, 'archive'])->name('briefings.archive');
    Route::post('briefings/{briefing}/share', [BriefingController::class, 'share'])->name('briefings.share');

    // Offers
    Route::get('offers/export-zip', [OfferController::class, 'exportZip'])->name('offers.export-zip');
    Route::resource('offers', OfferController::class);
    Route::post('offers/{offer}/send', [OfferController::class, 'send'])->name('offers.send');
    Route::post('offers/{offer}/blocks', [OfferController::class, 'syncBlocks'])->name('offers.blocks.sync');
    Route::post('offers/{offer}/blocks/image', [OfferController::class, 'uploadBlockImage'])->name('offers.blocks.image');
    Route::post('offers/{offer}/attachments', [OfferController::class, 'storeAttachment'])->name('offers.attachments.store');
    Route::delete('offers/{offer}/attachments/{attachment}', [OfferController::class, 'destroyAttachment'])->name('offers.attachments.destroy');
    Route::get('offers/{offer}/preview', [OfferController::class, 'preview'])->name('offers.preview');
    Route::get('offers/{offer}/download', [OfferController::class, 'download'])->name('offers.download');
    
    // Invoices
    Route::get('invoices/export-zip', [InvoiceController::class, 'exportZip'])->name('invoices.export-zip');
    Route::get('invoices/from-offer/{offer}', [InvoiceController::class, 'createFromOffer'])->name('invoices.from-offer');
    Route::resource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');
    Route::post('invoices/{invoice}/reminder', [InvoiceController::class, 'sendReminder'])->name('invoices.reminder');
    Route::post('invoices/{invoice}/credit-note', [InvoiceController::class, 'createCreditNote'])->name('invoices.credit-note');
    Route::post('invoices/{invoice}/recurring', [InvoiceController::class, 'configureRecurring'])->name('invoices.recurring');
    Route::post('invoices/{invoice}/mollie', [InvoiceController::class, 'createMollieCheckout'])->name('invoices.mollie');
    Route::post('invoices/{invoice}/peppol', [InvoiceController::class, 'sendPeppol'])->name('invoices.peppol');
    Route::post('invoices/{invoice}/postbode', [InvoiceController::class, 'sendPostbode'])->name('invoices.postbode');
    Route::post('offers/{offer}/postbode', [OfferController::class, 'sendPostbode'])->name('offers.postbode');
    Route::get('offers/{offer}/voice-note', [OfferController::class, 'downloadVoiceNote'])->name('offers.voice-note');
    Route::post('invoices/{invoice}/attachments', [InvoiceController::class, 'storeAttachment'])->name('invoices.attachments.store');
    Route::delete('invoices/{invoice}/attachments/{attachment}', [InvoiceController::class, 'destroyAttachment'])->name('invoices.attachments.destroy');
    Route::get('invoices/{invoice}/preview', [InvoiceController::class, 'preview'])->name('invoices.preview');
    Route::get('invoices/{invoice}/download', [InvoiceController::class, 'download'])->name('invoices.download');
    Route::get('invoices/{invoice}/ubl', [InvoiceController::class, 'downloadUbl'])->name('invoices.ubl');
    Route::post('invoices/{invoice}/payment', [InvoiceController::class, 'recordPayment'])->name('invoices.payment');
});

Route::middleware(['auth', 'verified.email', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
});

// Staff-only routes
Route::middleware(['auth', 'role:staff'])->group(function () {
    Route::get('/staff', function () {
        return Inertia::render('Staff/Dashboard');
    })->name('staff.dashboard');
});

// Routes accessible by both admin and staff
Route::middleware(['auth', 'role:admin|staff', 'redirect.admin'])->group(function () {
    Route::get('/reports', function () {
        return 'Reports';
    })->middleware('permission:view-reports')->name('reports');
});

require __DIR__.'/auth.php';
