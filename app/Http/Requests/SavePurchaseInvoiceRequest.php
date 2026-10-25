<?php

namespace App\Http\Requests;

use App\Support\PurchaseCategories;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePurchaseInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['nullable', 'integer'],
            'supplier_name' => ['required_without:supplier_id', 'nullable', 'string', 'max:255'],
            'supplier_vat' => ['nullable', 'string', 'max:32'],
            'supplier_address' => ['nullable', 'string', 'max:500'],
            'invoice_number' => ['required', 'string', 'max:64'],
            'invoice_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'category' => ['required', Rule::in(PurchaseCategories::KEYS)],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'iban' => ['nullable', 'string', 'max:64'],
            'payment_note' => ['nullable', 'string', 'max:2000'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.description' => ['required', 'string', 'max:255'],
            'lines.*.amount_excl' => ['required', 'numeric', 'min:0'],
            'file' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
