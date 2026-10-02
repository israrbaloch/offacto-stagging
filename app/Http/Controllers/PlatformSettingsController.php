<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Models\SubscriptionPlan;
use App\Services\PlatformMollieService;
use App\Support\PlatformLocales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    public function index(PlatformMollieService $mollie): Response
    {
        $activePlans = SubscriptionPlan::active()->count();

        return Inertia::render('Settings/Index', [
            'locales' => PlatformLocales::codes(),
            'overview' => [
                'payment_configured' => $mollie->isConfigured() && SiteSetting::get('payment_gateway', 'mollie') !== 'none',
                'active_plans' => $activePlans,
                'default_currency' => strtoupper(SiteSetting::get('platform_default_currency', 'EUR')),
            ],
            'general' => [
                'site_name' => SiteSetting::get('site_name', 'Offacto'),
                'admin_email' => SiteSetting::get('admin_email', ''),
                'allow_user_registration' => SiteSetting::getBoolean('allow_user_registration', true),
                'send_welcome_email' => SiteSetting::getBoolean('send_welcome_email', true),
                'require_company_approval' => SiteSetting::getBoolean('require_company_approval', false),
                'require_service_approval' => SiteSetting::getBoolean('require_service_approval', false),
            ],
            'platform' => [
                'platform_default_currency' => strtoupper(SiteSetting::get('platform_default_currency', 'EUR')),
                'default_vat_rate' => SiteSetting::getInteger('default_vat_rate', 21),
                'invoice_prefix' => SiteSetting::get('invoice_prefix', 'INV-'),
                'offer_prefix' => SiteSetting::get('offer_prefix', 'OFF-'),
            ],
            'payment' => [
                'gateway' => SiteSetting::get('payment_gateway', 'mollie'),
                'mollie_mode' => $mollie->mode(),
                'mollie_configured' => $mollie->isConfigured(),
                'mollie_test_key_set' => filled(SiteSetting::get('payment_mollie_test_key')),
                'mollie_live_key_set' => filled(SiteSetting::get('payment_mollie_live_key')),
            ],
            'plans' => SubscriptionPlan::ordered()->get()->map->toAdminArray(),
            'currencyOptions' => ['EUR', 'USD', 'GBP'],
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:120'],
            'admin_email' => ['required', 'email', 'max:255'],
            'allow_user_registration' => ['required', 'boolean'],
            'send_welcome_email' => ['required', 'boolean'],
            'require_company_approval' => ['required', 'boolean'],
            'require_service_approval' => ['required', 'boolean'],
        ]);

        SiteSetting::set('site_name', $data['site_name']);
        SiteSetting::set('admin_email', $data['admin_email']);
        SiteSetting::set('allow_user_registration', $data['allow_user_registration'] ? '1' : '0', 'boolean');
        SiteSetting::set('send_welcome_email', $data['send_welcome_email'] ? '1' : '0', 'boolean');
        SiteSetting::set('require_company_approval', $data['require_company_approval'] ? '1' : '0', 'boolean');
        SiteSetting::set('require_service_approval', $data['require_service_approval'] ? '1' : '0', 'boolean');
        SiteSetting::clearCache();

        return back()->with('status', 'general-settings-saved');
    }

    public function updatePlatform(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'platform_default_currency' => ['required', Rule::in(['EUR', 'USD', 'GBP'])],
            'default_vat_rate' => ['required', 'integer', 'min:0', 'max:100'],
            'invoice_prefix' => ['required', 'string', 'max:32'],
            'offer_prefix' => ['required', 'string', 'max:32'],
        ]);

        SiteSetting::set('platform_default_currency', $data['platform_default_currency']);
        SiteSetting::set('default_vat_rate', (string) $data['default_vat_rate'], 'integer');
        SiteSetting::set('invoice_prefix', $data['invoice_prefix']);
        SiteSetting::set('offer_prefix', $data['offer_prefix']);
        SiteSetting::clearCache();

        return back()->with('status', 'platform-settings-saved');
    }

    public function updatePaymentGateway(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'payment_gateway' => ['required', 'in:mollie,none'],
            'payment_mollie_mode' => ['required', 'in:test,live'],
            'payment_mollie_test_key' => ['nullable', 'string', 'max:255'],
            'payment_mollie_live_key' => ['nullable', 'string', 'max:255'],
        ]);

        SiteSetting::set('payment_gateway', $data['payment_gateway']);
        SiteSetting::set('payment_mollie_mode', $data['payment_mollie_mode']);

        if (filled($data['payment_mollie_test_key'] ?? null)) {
            SiteSetting::set('payment_mollie_test_key', $data['payment_mollie_test_key']);
        }

        if (filled($data['payment_mollie_live_key'] ?? null)) {
            SiteSetting::set('payment_mollie_live_key', $data['payment_mollie_live_key']);
        }

        SiteSetting::clearCache();

        return back()->with('status', 'payment-settings-saved');
    }

    public function updatePlans(Request $request): RedirectResponse
    {
        $locales = PlatformLocales::codes();

        $data = $request->validate([
            'plans' => ['required', 'array'],
            'plans.*.id' => ['required', 'integer', 'exists:subscription_plans,id'],
            'plans.*.price_cents' => ['required', 'integer', 'min:0'],
            'plans.*.currency' => ['required', Rule::in(['EUR', 'USD', 'GBP'])],
            'plans.*.is_active' => ['required', 'boolean'],
            'plans.*.is_highlighted' => ['required', 'boolean'],
            'plans.*.sort_order' => ['required', 'integer', 'min:0', 'max:255'],
            'plans.*.name_labels' => ['required', 'array'],
            'plans.*.description_labels' => ['required', 'array'],
            'plans.*.feature_items' => ['required', 'array'],
            'plans.*.feature_items.*.included' => ['required', 'boolean'],
            'plans.*.feature_items.*.label' => ['required', 'array'],
        ]);

        foreach ($data['plans'] as $row) {
            SubscriptionPlan::where('id', $row['id'])->update([
                'price_cents' => $row['price_cents'],
                'currency' => $row['currency'],
                'is_active' => $row['is_active'],
                'is_highlighted' => $row['is_highlighted'],
                'sort_order' => $row['sort_order'],
                'name_labels' => collect($row['name_labels'])->only($locales)->all(),
                'description_labels' => collect($row['description_labels'])->only($locales)->all(),
                'feature_items' => collect($row['feature_items'])->map(function ($item) use ($locales) {
                    return [
                        'included' => (bool) ($item['included'] ?? false),
                        'label' => collect($item['label'] ?? [])->only($locales)->all(),
                    ];
                })->values()->all(),
            ]);
        }

        return back()->with('status', 'plans-saved');
    }
}
