<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SendInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('email') && ! $this->has('emails')) {
            $this->merge(['emails' => [$this->input('email')]]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['in:email,postbode,whatsapp,peppol,mollie'],
            'reminder_enabled' => ['nullable', 'boolean'],
            'reminder_days_before_due' => ['nullable', 'integer', 'between:-30,30'],
            'emails' => ['nullable', 'array'],
            'emails.*' => ['email', 'max:255'],
            'email' => ['nullable', 'email'],
            'message' => ['nullable', 'string', 'max:10000'],
            'attach_ubl' => ['nullable', 'boolean'],
            'cc_company' => ['nullable', 'boolean'],
            'legal_document_ids' => ['nullable', 'array'],
            'legal_document_ids.*' => ['integer', 'exists:company_legal_documents,id'],
            'registered' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $channels = $this->input('channels', []);
            $emails = array_values(array_filter($this->input('emails', []), fn ($e) => filled($e)));
            if (in_array('email', $channels, true) && $emails === []) {
                $validator->errors()->add('emails', __('offers.send_emails_required'));
            }
            if ($this->boolean('reminder_enabled') && ! $this->has('reminder_days_before_due')) {
                $validator->errors()->add('reminder_days_before_due', __('invoices.reminder_offset_required'));
            }
        });
    }
}
