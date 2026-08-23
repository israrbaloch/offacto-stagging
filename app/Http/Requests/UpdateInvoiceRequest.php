<?php

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $activeCompany = $user?->activeCompany();

        return [
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'invoice_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:invoice_date'],
            'intro' => ['required', 'string'],
            'desc' => ['required', 'string'],
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
            'items' => ['required', 'array', 'min:1'],
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

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Please select a customer.',
            'items.required' => 'Please add at least one item to the invoice.',
            'items.min' => 'Please add at least one item to the invoice.',
            'intro.required' => 'The introduction field is required.',
            'desc.required' => 'The description field is required.',
        ];
    }
}
