<?php

use App\Http\Controllers\Admin\AdminActivityLogController;
use App\Http\Controllers\Admin\AdminCompanyController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminGlobalSearchController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminSecurityLogController;
use App\Http\Controllers\Admin\AdminBillingController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminComplianceController;
use App\Http\Controllers\Admin\AdminCommunicationController;
use App\Http\Controllers\Admin\AdminInfrastructureController;
use App\Http\Controllers\Admin\AdminGovernanceController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminSecurityController;
use App\Http\Controllers\Admin\AdminSupportController;
use App\Http\Controllers\Admin\AdminIntegrationController;
use App\Http\Controllers\Admin\AdminFinancialDocumentController;
use App\Http\Controllers\Admin\AdminPlatformSettingsController;
use App\Http\Controllers\Admin\AdminSubscriptionPlanController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BriefingController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\MolliePaymentReturnController;
use App\Http\Controllers\MollieWebhookController;
use App\Http\Controllers\InboundEmailWebhookController;
use App\Http\Controllers\PublicBriefingController;
use App\Http\Controllers\PublicOfferController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SupportTicketController;
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
Route::post('/webhooks/inbound-email', InboundEmailWebhookController::class)->name('webhooks.inbound-email');
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

Route::redirect('/settings', '/admin/settings')->middleware(['auth', 'role:admin']);

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

    Route::get('/support', [SupportTicketController::class, 'index'])->name('support');
    Route::get('/support/tickets/{ticket}', [SupportTicketController::class, 'show'])->name('support.tickets.show');
    Route::post('/support/tickets', [SupportTicketController::class, 'store'])->name('support.tickets.store');
    Route::post('/support/tickets/{ticket}/messages', [SupportTicketController::class, 'storeMessage'])->name('support.tickets.messages.store');
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

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AdminAuthController::class, 'login'])->name('admin.login');
});

Route::middleware(['auth', 'verified.email', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/search', AdminGlobalSearchController::class)->name('search');
    Route::get('/mfa', [AdminAuthController::class, 'mfaChallenge'])->name('mfa');

    Route::get('/settings', [AdminPlatformSettingsController::class, 'index'])->name('settings.index');
    Route::get('/settings/{section}', [AdminPlatformSettingsController::class, 'show'])->name('settings.show');
    Route::patch('/settings/{section}', [AdminPlatformSettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/{section}/reset', [AdminPlatformSettingsController::class, 'reset'])->name('settings.reset');

    Route::get('/financial', [AdminFinancialDocumentController::class, 'index'])->name('financial.index');
    Route::get('/financial/operations/{section}', [AdminFinancialDocumentController::class, 'operation'])->name('financial.operation');
    Route::post('/financial/audit-export', [AdminFinancialDocumentController::class, 'auditExport'])->name('financial.audit-export');
    Route::get('/financial/{section}', [AdminFinancialDocumentController::class, 'show'])->name('financial.show');
    Route::patch('/financial/{section}', [AdminFinancialDocumentController::class, 'update'])->name('financial.update');
    Route::post('/financial/{section}/reset', [AdminFinancialDocumentController::class, 'reset'])->name('financial.reset');

    Route::get('/compliance', [AdminComplianceController::class, 'index'])->name('compliance.index');
    Route::get('/compliance/operations/{section}', [AdminComplianceController::class, 'operation'])->name('compliance.operation');
    Route::post('/compliance/reports/export', [AdminComplianceController::class, 'complianceReportExport'])->name('compliance.reports.export');
    Route::post('/compliance/legal-notices', [AdminComplianceController::class, 'storeLegalNotice'])->name('compliance.legal-notices.store');
    Route::post('/compliance/dsar', [AdminComplianceController::class, 'storeDataSubjectRequest'])->name('compliance.dsar.store');
    Route::patch('/compliance/dsar/{dsar}', [AdminComplianceController::class, 'updateDataSubjectRequest'])->name('compliance.dsar.update');
    Route::post('/compliance/authority-requests', [AdminComplianceController::class, 'storeAuthorityRequest'])->name('compliance.authority.store');
    Route::patch('/compliance/authority-requests/{authorityRequest}/advance', [AdminComplianceController::class, 'advanceAuthorityRequest'])->name('compliance.authority.advance');
    Route::post('/compliance/disclosures', [AdminComplianceController::class, 'storeDisclosure'])->name('compliance.disclosures.store');
    Route::post('/compliance/evidence', [AdminComplianceController::class, 'storeEvidence'])->name('compliance.evidence.store');
    Route::post('/compliance/legal-holds', [AdminComplianceController::class, 'storeLegalHold'])->name('compliance.legal-holds.store');
    Route::post('/compliance/legal-holds/{hold}/release', [AdminComplianceController::class, 'releaseLegalHold'])->name('compliance.legal-holds.release');
    Route::post('/compliance/deletion-jobs', [AdminComplianceController::class, 'storeDeletionJob'])->name('compliance.deletion-jobs.store');
    Route::post('/compliance/deletion-jobs/{job}/approve', [AdminComplianceController::class, 'approveDeletionJob'])->name('compliance.deletion-jobs.approve');
    Route::post('/compliance/breaches', [AdminComplianceController::class, 'storeBreach'])->name('compliance.breaches.store');
    Route::get('/compliance/{section}', [AdminComplianceController::class, 'show'])->name('compliance.show');
    Route::patch('/compliance/{section}', [AdminComplianceController::class, 'update'])->name('compliance.update');
    Route::post('/compliance/{section}/reset', [AdminComplianceController::class, 'reset'])->name('compliance.reset');

    Route::get('/integrations', [AdminIntegrationController::class, 'index'])->name('integrations.index');
    Route::get('/integrations/operations/{section}', [AdminIntegrationController::class, 'operation'])->name('integrations.operation');
    Route::post('/integrations/health-checks/run', [AdminIntegrationController::class, 'runHealthChecks'])->name('integrations.health.run');
    Route::post('/integrations/webhooks', [AdminIntegrationController::class, 'storeWebhook'])->name('integrations.webhooks.store');
    Route::patch('/integrations/webhooks/{webhook}/toggle', [AdminIntegrationController::class, 'toggleWebhook'])->name('integrations.webhooks.toggle');
    Route::post('/integrations/api-keys', [AdminIntegrationController::class, 'storeApiKey'])->name('integrations.api-keys.store');
    Route::post('/integrations/api-keys/{apiKey}/revoke', [AdminIntegrationController::class, 'revokeApiKey'])->name('integrations.api-keys.revoke');
    Route::post('/integrations/failures/{failure}/resolve', [AdminIntegrationController::class, 'resolveFailure'])->name('integrations.failures.resolve');
    Route::post('/integrations/providers', [AdminIntegrationController::class, 'storeProvider'])->name('integrations.providers.store');
    Route::patch('/integrations/providers/{provider}', [AdminIntegrationController::class, 'updateProvider'])->name('integrations.providers.update');
    Route::get('/integrations/{section}', [AdminIntegrationController::class, 'show'])->name('integrations.show');
    Route::patch('/integrations/{section}', [AdminIntegrationController::class, 'update'])->name('integrations.update');
    Route::post('/integrations/{section}/reset', [AdminIntegrationController::class, 'reset'])->name('integrations.reset');

    Route::get('/communications', [AdminCommunicationController::class, 'index'])->name('communications.index');
    Route::get('/communications/operations/{section}', [AdminCommunicationController::class, 'operation'])->name('communications.operation');
    Route::post('/communications/test-send', [AdminCommunicationController::class, 'sendTestEmail'])->name('communications.test-send');
    Route::post('/communications/outbound-test', [AdminCommunicationController::class, 'testOutboundConnection'])->name('communications.outbound-test');
    Route::post('/communications/queue/retry', [AdminCommunicationController::class, 'retryFailedJob'])->name('communications.queue.retry');
    Route::get('/communications/{section}', [AdminCommunicationController::class, 'show'])->name('communications.show');
    Route::patch('/communications/{section}', [AdminCommunicationController::class, 'update'])->name('communications.update');
    Route::post('/communications/{section}/reset', [AdminCommunicationController::class, 'reset'])->name('communications.reset');

    Route::get('/support', [AdminSupportController::class, 'index'])->name('support.index');
    Route::get('/support/tickets', [AdminSupportController::class, 'ticketsIndex'])->name('support.tickets.index');
    Route::post('/support/tickets', [AdminSupportController::class, 'storeTicket'])->name('support.tickets.store');
    Route::get('/support/tickets/{ticket}', [AdminSupportController::class, 'ticketShow'])->name('support.tickets.show');
    Route::patch('/support/tickets/{ticket}', [AdminSupportController::class, 'updateTicket'])->name('support.tickets.update');
    Route::post('/support/tickets/{ticket}/messages', [AdminSupportController::class, 'storeMessage'])->name('support.tickets.messages.store');
    Route::get('/support/operations/{section}', [AdminSupportController::class, 'operation'])->name('support.operation');
    Route::post('/support/access-requests', [AdminSupportController::class, 'storeAccessRequest'])->name('support.access.store');
    Route::post('/support/access-requests/{accessRequest}/approve', [AdminSupportController::class, 'approveAccess'])->name('support.access.approve');
    Route::post('/support/recovery-requests', [AdminSupportController::class, 'storeRecovery'])->name('support.recovery.store');
    Route::patch('/support/recovery-requests/{recovery}', [AdminSupportController::class, 'updateRecovery'])->name('support.recovery.update');
    Route::post('/support/macros', [AdminSupportController::class, 'storeMacro'])->name('support.macros.store');
    Route::post('/support/articles', [AdminSupportController::class, 'storeArticle'])->name('support.articles.store');
    Route::post('/support/feedback', [AdminSupportController::class, 'storeFeedback'])->name('support.feedback.store');
    Route::patch('/support/feedback/{feedback}', [AdminSupportController::class, 'updateFeedback'])->name('support.feedback.update');
    Route::post('/support/escalations', [AdminSupportController::class, 'storeEscalation'])->name('support.escalations.store');
    Route::get('/support/{section}', [AdminSupportController::class, 'show'])->name('support.show');
    Route::patch('/support/{section}', [AdminSupportController::class, 'update'])->name('support.update');
    Route::post('/support/{section}/reset', [AdminSupportController::class, 'reset'])->name('support.reset');

    Route::get('/infrastructure', [AdminInfrastructureController::class, 'index'])->name('infrastructure.index');
    Route::get('/infrastructure/operations/{section}', [AdminInfrastructureController::class, 'operation'])->name('infrastructure.operation');
    Route::post('/infrastructure/backups', [AdminInfrastructureController::class, 'storeBackupRun'])->name('infrastructure.backups.store');
    Route::post('/infrastructure/restore-tests', [AdminInfrastructureController::class, 'storeRestoreTest'])->name('infrastructure.restore-tests.store');
    Route::post('/infrastructure/maintenance-windows', [AdminInfrastructureController::class, 'storeMaintenanceWindow'])->name('infrastructure.maintenance-windows.store');
    Route::post('/infrastructure/failed-jobs/retry', [AdminInfrastructureController::class, 'retryFailedJob'])->name('infrastructure.failed-jobs.retry');
    Route::get('/infrastructure/{section}', [AdminInfrastructureController::class, 'show'])->name('infrastructure.show');
    Route::patch('/infrastructure/{section}', [AdminInfrastructureController::class, 'update'])->name('infrastructure.update');
    Route::post('/infrastructure/{section}/reset', [AdminInfrastructureController::class, 'reset'])->name('infrastructure.reset');

    Route::get('/governance', [AdminGovernanceController::class, 'index'])->name('governance.index');
    Route::get('/governance/operations/{section}', [AdminGovernanceController::class, 'operation'])->name('governance.operation');
    Route::post('/governance/bulk/preview', [AdminGovernanceController::class, 'previewBulk'])->name('governance.bulk.preview');
    Route::post('/governance/bulk/{bulk}/execute', [AdminGovernanceController::class, 'executeBulk'])->name('governance.bulk.execute');
    Route::post('/governance/imports', [AdminGovernanceController::class, 'storeImport'])->name('governance.imports.store');
    Route::post('/governance/exports', [AdminGovernanceController::class, 'storeExport'])->name('governance.exports.store');
    Route::post('/governance/exports/{export}/downloaded', [AdminGovernanceController::class, 'markExportDownloaded'])->name('governance.exports.downloaded');
    Route::post('/governance/snapshots', [AdminGovernanceController::class, 'storeSnapshot'])->name('governance.snapshots.store');
    Route::post('/governance/snapshots/{snapshot}/restore', [AdminGovernanceController::class, 'restoreSnapshot'])->name('governance.snapshots.restore');
    Route::post('/governance/scheduled-changes', [AdminGovernanceController::class, 'storeScheduledChange'])->name('governance.scheduled.store');
    Route::post('/governance/simulate', [AdminGovernanceController::class, 'simulateChange'])->name('governance.simulate');
    Route::post('/governance/runbooks', [AdminGovernanceController::class, 'storeRunbook'])->name('governance.runbooks.store');
    Route::post('/governance/automation-keys', [AdminGovernanceController::class, 'issueAutomationKey'])->name('governance.automation-keys.store');
    Route::post('/governance/automation-keys/{key}/revoke', [AdminGovernanceController::class, 'revokeAutomationKey'])->name('governance.automation-keys.revoke');
    Route::get('/governance/{section}', [AdminGovernanceController::class, 'show'])->name('governance.show');
    Route::patch('/governance/{section}', [AdminGovernanceController::class, 'update'])->name('governance.update');
    Route::post('/governance/{section}/reset', [AdminGovernanceController::class, 'reset'])->name('governance.reset');

    Route::get('/product', [AdminProductController::class, 'index'])->name('product.index');
    Route::get('/product/operations/{section}', [AdminProductController::class, 'operation'])->name('product.operation');
    Route::post('/product/public-pages', [AdminProductController::class, 'storePublicPage'])->name('product.public-pages.store');
    Route::patch('/product/public-pages/{page}', [AdminProductController::class, 'updatePublicPage'])->name('product.public-pages.update');
    Route::post('/product/announcements', [AdminProductController::class, 'storeAnnouncement'])->name('product.announcements.store');
    Route::patch('/product/announcements/{announcement}/publish', [AdminProductController::class, 'toggleAnnouncement'])->name('product.announcements.publish');
    Route::post('/product/testimonials', [AdminProductController::class, 'storeTestimonial'])->name('product.testimonials.store');
    Route::patch('/product/testimonials/{testimonial}', [AdminProductController::class, 'updateTestimonial'])->name('product.testimonials.update');
    Route::post('/product/help-articles', [AdminProductController::class, 'storeHelpArticle'])->name('product.help-articles.store');
    Route::post('/product/release-notes', [AdminProductController::class, 'storeReleaseNote'])->name('product.release-notes.store');
    Route::post('/product/feature-rollouts', [AdminProductController::class, 'storeFeatureRollout'])->name('product.feature-rollouts.store');
    Route::patch('/product/feature-rollouts/{rollout}', [AdminProductController::class, 'updateFeatureRollout'])->name('product.feature-rollouts.update');
    Route::post('/product/ab-experiments', [AdminProductController::class, 'storeAbExperiment'])->name('product.ab-experiments.store');
    Route::patch('/product/ab-experiments/{experiment}', [AdminProductController::class, 'updateAbExperiment'])->name('product.ab-experiments.update');
    Route::post('/product/feedback', [AdminProductController::class, 'storeFeedback'])->name('product.feedback.store');
    Route::patch('/product/feedback/{feedback}', [AdminProductController::class, 'updateFeedback'])->name('product.feedback.update');
    Route::post('/product/roadmap', [AdminProductController::class, 'storeRoadmapItem'])->name('product.roadmap.store');
    Route::patch('/product/roadmap/{roadmap}', [AdminProductController::class, 'updateRoadmapItem'])->name('product.roadmap.update');
    Route::get('/product/{section}', [AdminProductController::class, 'show'])->name('product.show');
    Route::patch('/product/{section}', [AdminProductController::class, 'update'])->name('product.update');
    Route::post('/product/{section}/reset', [AdminProductController::class, 'reset'])->name('product.reset');

    Route::get('/security', [AdminSecurityController::class, 'index'])->name('security.index');
    Route::get('/security/operations/{section}', [AdminSecurityController::class, 'operation'])->name('security.operation');
    Route::post('/security/restrictions', [AdminSecurityController::class, 'storeRestriction'])->name('security.restrictions.store');
    Route::post('/security/fraud-reviews', [AdminSecurityController::class, 'storeFraudReview'])->name('security.fraud.store');
    Route::patch('/security/fraud-reviews/{review}', [AdminSecurityController::class, 'updateFraudReview'])->name('security.fraud.update');
    Route::post('/security/rotation-tasks/{task}/complete', [AdminSecurityController::class, 'completeRotation'])->name('security.rotation.complete');
    Route::post('/security/vulnerability-scan', [AdminSecurityController::class, 'runVulnerabilityScan'])->name('security.vuln.scan');
    Route::post('/security/incidents', [AdminSecurityController::class, 'storeIncident'])->name('security.incidents.store');
    Route::post('/security/policy-exceptions', [AdminSecurityController::class, 'storePolicyException'])->name('security.exceptions.store');
    Route::post('/security/policy-exceptions/{exception}/revoke', [AdminSecurityController::class, 'revokePolicyException'])->name('security.exceptions.revoke');
    Route::get('/security/{section}', [AdminSecurityController::class, 'show'])->name('security.show');
    Route::patch('/security/{section}', [AdminSecurityController::class, 'update'])->name('security.update');
    Route::post('/security/{section}/reset', [AdminSecurityController::class, 'reset'])->name('security.reset');
    Route::get('/subscriptions', [AdminSubscriptionController::class, 'dashboard'])->name('subscriptions.dashboard');
    Route::get('/subscriptions/directory', [AdminSubscriptionController::class, 'directory'])->name('subscriptions.directory');
    Route::get('/subscriptions/companies/{company}', [AdminSubscriptionController::class, 'show'])->name('subscriptions.show');
    Route::post('/subscriptions/companies/{company}/adjust', [AdminSubscriptionController::class, 'adjust'])->name('subscriptions.adjust');

    Route::get('/plans', [AdminSubscriptionPlanController::class, 'index'])->name('plans.index');
    Route::post('/plans', [AdminSubscriptionPlanController::class, 'store'])->name('plans.store');
    Route::patch('/plans', [AdminSubscriptionPlanController::class, 'update'])->name('plans.update');
    Route::post('/plans/{plan}/archive', [AdminSubscriptionPlanController::class, 'archive'])->name('plans.archive');
    Route::delete('/plans/{plan}', [AdminSubscriptionPlanController::class, 'destroy'])->name('plans.destroy');

    Route::get('/billing/settings', [AdminBillingController::class, 'settings'])->name('billing.settings');
    Route::patch('/billing/settings', [AdminBillingController::class, 'updateSettings'])->name('billing.settings.update');
    Route::get('/billing/coupons', [AdminBillingController::class, 'coupons'])->name('billing.coupons');
    Route::post('/billing/coupons', [AdminBillingController::class, 'storeCoupon'])->name('billing.coupons.store');
    Route::patch('/billing/coupons/{coupon}', [AdminBillingController::class, 'updateCoupon'])->name('billing.coupons.update');
    Route::get('/billing/payments', [AdminBillingController::class, 'payments'])->name('billing.payments');
    Route::get('/billing/reports', [AdminBillingController::class, 'reports'])->name('billing.reports');
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::post('/users/{user}/roles', [AdminUserController::class, 'syncRoles'])->name('users.roles');
    Route::post('/users/{user}/send-password-reset', [AdminUserController::class, 'sendPasswordReset'])->name('users.send-password-reset');
    Route::post('/users/{user}/verify-email', [AdminUserController::class, 'verifyEmail'])->name('users.verify-email');
    Route::post('/users/{user}/unverify-email', [AdminUserController::class, 'unverifyEmail'])->name('users.unverify-email');
    Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('users.reset-password');
    Route::post('/users/{user}/revoke-sessions', [AdminUserController::class, 'revokeSessions'])->name('users.revoke-sessions');
    Route::post('/users/{user}/toggle-billing-reminders', [AdminUserController::class, 'toggleBillingReminders'])->name('users.toggle-billing-reminders');
    Route::get('/logs/activity', [AdminActivityLogController::class, 'index'])->name('logs.activity');
    Route::get('/logs/security', [AdminSecurityLogController::class, 'index'])->name('logs.security');

    Route::get('/companies', [AdminCompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/approvals', [AdminCompanyController::class, 'approvals'])->name('companies.approvals');
    Route::post('/workspace/exit', [AdminCompanyController::class, 'exitWorkspace'])->name('workspace.exit');
    Route::get('/companies/{company}/edit', [AdminCompanyController::class, 'edit'])->name('companies.edit');
    Route::get('/companies/{company}', [AdminCompanyController::class, 'show'])->name('companies.show');
    Route::patch('/companies/{company}', [AdminCompanyController::class, 'update'])->name('companies.update');
    Route::post('/companies/{company}/approve', [AdminCompanyController::class, 'approve'])->name('companies.approve');
    Route::post('/companies/{company}/reject', [AdminCompanyController::class, 'reject'])->name('companies.reject');
    Route::post('/companies/{company}/request-info', [AdminCompanyController::class, 'requestInfo'])->name('companies.request-info');
    Route::post('/companies/{company}/status', [AdminCompanyController::class, 'applyStatus'])->name('companies.status');
    Route::post('/companies/{company}/workspace', [AdminCompanyController::class, 'enterWorkspace'])->name('companies.workspace');
    Route::post('/companies/{company}/exports', [AdminCompanyController::class, 'storeExport'])->name('companies.exports.store');
    Route::get('/companies/{company}/exports/{export}/download', [AdminCompanyController::class, 'downloadExport'])->name('companies.exports.download');
    Route::post('/companies/{company}/overrides', [AdminCompanyController::class, 'storeOverride'])->name('companies.overrides.store');
    Route::delete('/companies/{company}/overrides/{override}', [AdminCompanyController::class, 'destroyOverride'])->name('companies.overrides.destroy');
    Route::patch('/companies/{company}/verification', [AdminCompanyController::class, 'updateVerification'])->name('companies.verification.update');
    Route::post('/companies/{company}/deletion-requests', [AdminCompanyController::class, 'storeDeletionRequest'])->name('companies.deletion.store');
    Route::patch('/companies/{company}/deletion-requests/{deletionRequest}', [AdminCompanyController::class, 'updateDeletionRequest'])->name('companies.deletion.update');
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
