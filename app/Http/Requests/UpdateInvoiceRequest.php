<?php

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->customer_id === '' || $this->customer_id === '0') {
            $this->merge(['customer_id' => null]);
        }

        if ($this->ip_transfer_type === '') {
            $this->merge(['ip_transfer_type' => null]);
        }

        if ($this->customer_reference === '') {
            $this->merge(['customer_reference' => null]);
        }

        $this->merge([
            'items' => collect($this->input('items', []))->map(function ($item) {
                if (! is_array($item)) {
                    return $item;
                }
                if (($item['service_id'] ?? '') === '' || ($item['service_id'] ?? null) === '0') {
                    $item['service_id'] = null;
                }

                return $item;
            })->all(),
        ]);
    }

    public function rules(): array
    {
        $user = $this->user();
        $activeCompany = $user?->activeCompany();

        return [
            'customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'invoice_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:invoice_date'],
            'payment_term' => ['nullable', 'string', Rule::in(['30', '14', 'immediate'])],
            'customer_reference' => ['nullable', 'string', 'max:120'],
            'intro' => ['nullable', 'string'],
            'desc' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'email_message' => ['nullable', 'string'],
            'status' => [
                'required',
                'integer',
                Rule::exists('status', 'id')->where('for', 'invoices'),
            ],
            'ip_transfer_type' => [
                'nullable',
                'string',
                Rule::in([Invoice::IP_FULL_TRANSFER, Invoice::IP_LICENSE_TO_USE]),
            ],
            'autosave' => ['sometimes', 'boolean'],
            'is_recurring' => ['sometimes', 'boolean'],
            'recurring_interval' => ['nullable', 'in:weekly,monthly,yearly'],
            'items' => ['nullable', 'array'],
            'items.*.service_id' => [
                'nullable',
                'integer',
                Rule::exists('services', 'id')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'items.*.description' => ['nullable', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'numeric', 'not_in:0'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'action' => ['nullable', 'string', Rule::in(['draft', 'send'])],
        ];
    }
}
