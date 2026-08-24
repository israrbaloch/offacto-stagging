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
            'intro' => ['nullable', 'string'],
            'desc' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
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
            'items' => ['nullable', 'array'],
            'items.*.service_id' => [
                'required',
                'integer',
                Rule::exists('services', 'id')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'items.*.description' => ['nullable', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'action' => ['nullable', 'string', Rule::in(['draft', 'send'])],
        ];
    }
}
