<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\CommunicationTestMail;
use App\Models\ActivityLog;
use App\Models\CommunicationDeliveryLog;
use App\Models\SiteSetting;
use App\Services\PlatformSettingsService;
use App\Support\AdminCommunicationInsights;
use App\Support\PlatformMailConfigurator;
use App\Support\CommunicationMergeCodes;
use App\Support\CommunicationSettingsRegistry;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminCommunicationController extends Controller
{
    private const REGISTRY = CommunicationSettingsRegistry::class;

    public function index(): InertiaResponse
    {
        $sections = CommunicationSettingsRegistry::sections();
        $grouped = collect($sections)->groupBy('group')->map(fn ($items, $group) => [
            'group' => $group,
            'items' => $items->values(),
        ])->values();

        return Inertia::render('Admin/Communications/Index', [
            'metrics' => AdminCommunicationInsights::dashboard(),
            'groups' => $grouped,
        ]);
    }

    public function show(string $section, PlatformSettingsService $settings): InertiaResponse|RedirectResponse
    {
        if (CommunicationSettingsRegistry::isOperationSection($section)) {
            return redirect()->route('admin.communications.operation', $section);
        }

        $def = CommunicationSettingsRegistry::definition($section);
        if (! $def) {
            abort(404);
        }

        $extra = [];
        if ($section === 'email-variables') {
            $extra['mergeCatalog'] = CommunicationMergeCodes::catalog();
        }
        if ($section === 'incoming-email') {
            $extra['inboundWebhookUrl'] = url('/webhooks/inbound-email');
        }
        if ($section === 'outgoing-email') {
            $extra['outboundConfigured'] = PlatformMailConfigurator::isOutboundConfigured();
        }

        return Inertia::render('Admin/Communications/Show', [
            'section' => [
                'id' => $section,
                'title' => $def['title'],
                'description' => $def['description'],
                'group' => $def['group'],
            ],
            'fields' => $def['fields'],
            'values' => $settings->valuesForSection($section, self::REGISTRY),
            'nav' => CommunicationSettingsRegistry::sections(),
            'locales' => PlatformLocales::codes(),
            ...$extra,
        ]);
    }

    public function update(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        if (CommunicationSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $settings->handleUploads($section, $request, self::REGISTRY);
        $data = $settings->validateSection($section, $request, self::REGISTRY);

        if ($section === 'template-library' && SiteSetting::getBoolean('comm_validate_merge_codes', true)) {
            $this->assertValidMergeCodesInTemplates($data['email_templates'] ?? []);
        }

        $settings->persistSection($section, $data, self::REGISTRY, 'admin.communications.updated');

        return back()->with('status', 'communication-settings-saved');
    }

    public function reset(string $section, Request $request, PlatformSettingsService $settings): RedirectResponse
    {
        $request->validate(['confirm' => ['required', 'accepted']]);
        $settings->resetSection($section, self::REGISTRY, 'admin.communications.reset');

        return back()->with('status', 'communication-settings-reset');
    }

    public function operation(string $section, PlatformSettingsService $settings): InertiaResponse
    {
        if (! CommunicationSettingsRegistry::isOperationSection($section)) {
            abort(404);
        }

        $meta = collect(CommunicationSettingsRegistry::operationSections())->firstWhere('id', $section);
        $templateValues = $settings->valuesForSection('template-library', self::REGISTRY);

        $payload = match ($section) {
            'preview-testing' => [
                'templates' => $templateValues['email_templates'] ?? [],
                'mergeCatalog' => CommunicationMergeCodes::catalog(),
                'templateLabels' => $this->templateLabels(),
            ],
            'delivery-analytics' => ['analytics' => AdminCommunicationInsights::deliveryAnalytics()],
            'queue-monitor' => [
                'queuePending' => AdminCommunicationInsights::dashboard()['queue_pending'],
                'failedJobs' => AdminCommunicationInsights::queueFailed(),
            ],
            'communication-history' => [
                'history' => AdminCommunicationInsights::communicationHistory(),
                'metadataOnly' => true,
            ],
            default => [],
        };

        return Inertia::render('Admin/Communications/Operation', [
            'section' => $meta,
            'operation' => $section,
            'nav' => CommunicationSettingsRegistry::sections(),
            ...$payload,
        ]);
    }

    public function sendTestEmail(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'template_key' => ['required', 'string', 'max:64'],
            'confirm_test' => ['accepted'],
        ]);

        $templates = SiteSetting::get('email_templates', []);
        if (is_string($templates)) {
            $templates = json_decode($templates, true) ?: [];
        }
        $tpl = $templates[$data['template_key']] ?? ['subject' => 'Test', 'body' => ''];
        $subject = CommunicationMergeCodes::sampleMerge($tpl['subject'] ?? 'Test', 'invoice');
        $body = CommunicationMergeCodes::sampleMerge($tpl['body'] ?? '', 'invoice');

        PlatformMailConfigurator::apply();

        $recipient = $request->user()->email;
        $htmlBody = $body !== '' ? nl2br(e($body)) : '';
        Mail::to($recipient)->send(new CommunicationTestMail($subject, $htmlBody, $data['template_key']));

        CommunicationDeliveryLog::create([
            'template_key' => $data['template_key'],
            'event_type' => 'test_send',
            'recipient_masked' => CommunicationDeliveryLog::maskEmail($recipient),
            'status' => 'sent',
            'provider' => config('mail.default'),
            'subject_snapshot' => $subject,
            'is_test' => true,
            'sent_at' => now(),
            'metadata' => ['actor_id' => $request->user()->id],
        ]);

        ActivityLog::record('admin.communications.test_sent', metadata: ['template' => $data['template_key']]);

        return back()->with('status', 'communication-test-sent');
    }

    public function testOutboundConnection(Request $request): RedirectResponse
    {
        $request->validate(['confirm_test' => ['accepted']]);

        PlatformMailConfigurator::apply();

        $recipient = $request->user()->email;
        Mail::raw(
            'This is a test message from Offacto outgoing email settings. If you received this, SMTP/provider configuration is working.',
            function ($message) use ($recipient) {
                $message->to($recipient)->subject('Offacto outgoing email test');
            }
        );

        ActivityLog::record('admin.communications.outbound_test', metadata: ['recipient' => $recipient]);

        return back()->with('status', 'communication-outbound-test-sent');
    }

    public function retryFailedJob(Request $request, \App\Services\FailedJobRetryService $retry): RedirectResponse
    {
        $data = $request->validate([
            'uuid' => ['required', 'uuid'],
            'confirm' => ['accepted'],
        ]);

        \App\Support\AdminAccess::assert($request->user(), \App\Support\AdminAccess::GOVERNANCE);
        $retry->retry($data['uuid'], 'communications');

        return back()->with('status', 'communication-queue-retried');
    }

    /**
     * @param  array<string, array{subject?: string, body?: string}>  $templates
     */
    private function assertValidMergeCodesInTemplates(array $templates): void
    {
        $allowed = $this->allowedMergeCodes();
        $errors = [];
        foreach ($templates as $key => $tpl) {
            $text = ($tpl['subject'] ?? '').($tpl['body'] ?? '');
            preg_match_all('/#[A-Z0-9_]+#/', $text, $matches);
            $unknown = array_diff(array_unique($matches[0] ?? []), $allowed);
            if ($unknown !== []) {
                $errors["email_templates.{$key}"] = 'Unknown merge codes: '.implode(', ', $unknown);
            }
        }
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    /**
     * @return list<string>
     */
    private function allowedMergeCodes(): array
    {
        $codes = CommunicationMergeCodes::codes();
        $custom = SiteSetting::get('comm_custom_merge_codes', []);
        if (is_string($custom)) {
            $custom = json_decode($custom, true) ?: [];
        }
        foreach ($custom as $row) {
            if (is_array($row) && filled($row['code'] ?? null)) {
                $codes[] = strtoupper((string) $row['code']);
            }
        }

        return array_values(array_unique($codes));
    }

    /**
     * @return array<string, string>
     */
    private function templateLabels(): array
    {
        return [
            'verification' => 'Email verification',
            'password_reset' => 'Password reset',
            'offer_sent' => 'Quotation sent',
            'invoice_sent' => 'Invoice sent',
            'payment_reminder' => 'Payment reminder',
            'subscription_renewal' => 'Subscription renewal',
            'subscription_cancelled' => 'Subscription cancelled',
        ];
    }
}
