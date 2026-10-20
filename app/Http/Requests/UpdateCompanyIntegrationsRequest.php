<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyIntegrationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->activeCompany();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'integrations_mode' => ['required', 'in:test,live'],
            'mollie_enabled' => ['sometimes', 'boolean'],
            'postbode_enabled' => ['sometimes', 'boolean'],
            'peppol_enabled' => ['sometimes', 'boolean'],
            'mollie_test_key' => ['nullable', 'string', 'max:255'],
            'mollie_live_key' => ['nullable', 'string', 'max:255'],
            'postbode_test_token' => ['nullable', 'string', 'max:512'],
            'postbode_live_token' => ['nullable', 'string', 'max:512'],
            'postbode_mailbox_code' => ['nullable', 'string', 'max:32'],
            'postbode_envelope_uuid' => ['nullable', 'string', 'max:64'],
            'postbode_v1_mailbox_id' => ['nullable', 'integer', 'min:1'],
            'postbode_v1_envelope_id' => ['nullable', 'integer', 'min:1', 'max:999'],
            'postbode_default_country' => ['nullable', 'string', 'size:2'],
            'postbode_registered' => ['sometimes', 'boolean'],
            'postbode_send_immediately' => ['sometimes', 'boolean'],
            'postbode_api_version' => ['required', 'in:v1,v2'],
            'peppol_test_endpoint' => ['nullable', 'string', 'max:512'],
            'peppol_live_endpoint' => ['nullable', 'string', 'max:512'],
            'peppol_test_token' => ['nullable', 'string', 'max:512'],
            'peppol_live_token' => ['nullable', 'string', 'max:512'],
            'whatsapp_enabled' => ['sometimes', 'boolean'],
            'whatsapp_use_customer_phone' => ['sometimes', 'boolean'],
            'whatsapp_business_phone' => ['nullable', 'string', 'max:32'],
            'whatsapp_invoice_template' => ['nullable', 'string', 'max:2000'],
            'whatsapp_quotation_template' => ['nullable', 'string', 'max:2000'],
            'whatsapp_api_enabled' => ['sometimes', 'boolean'],
            'whatsapp_api_phone_number_id' => ['nullable', 'string', 'max:64'],
            'whatsapp_api_access_token' => ['nullable', 'string', 'max:512'],
            'creditsafe_enabled' => ['sometimes', 'boolean'],
            'creditsafe_test_api_key' => ['nullable', 'string', 'max:512'],
            'creditsafe_live_api_key' => ['nullable', 'string', 'max:512'],
        ];
    }
}
