<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfferRequest extends FormRequest
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
    protected function prepareForValidation(): void
    {
        if ($this->boolean('from_builder') && ($this->customer_id === '' || $this->customer_id === '0')) {
            $this->merge(['customer_id' => null]);
        }
    }

    public function rules(): array
    {
        $user = $this->user();
        $activeCompany = $user?->activeCompany();
        $builder = $this->boolean('from_builder');

        return [
            'from_builder' => ['sometimes', 'boolean'],
            'customer_id' => [
                $builder ? 'nullable' : 'required',
                'integer',
                Rule::exists('customers', 'id')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'offer_date' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:offer_date'],
            'intro' => ['nullable', 'string'],
            'desc' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'payment_terms' => ['nullable', 'string', 'max:5000'],
            'vat_rate' => ['nullable', 'numeric', 'in:0,6,12,21'],
            'quote_template' => ['nullable', 'string', 'max:32'],
            'require_nda_before_open' => ['sometimes', 'boolean'],
            'mollie_deposit_enabled' => ['sometimes', 'boolean'],
            'on_acceptance_invoice' => ['nullable', 'string', 'in:draft,send'],
            'email_message' => ['nullable', 'string'],
            'blocks' => ['nullable', 'array'],
            'blocks.*.type' => ['required_with:blocks', 'in:text,image,video,table,sign,voice,attachments'],
            'blocks.*.content' => ['nullable', 'array'],
            'blocks.*.sort_order' => ['nullable', 'integer'],
            'status' => [
                'required',
                'integer',
                Rule::exists('status', 'id')->where('for', 'offers'),
            ],
            'items' => [$builder ? 'nullable' : 'required', 'array', $builder ? 'min:0' : 'min:1'],
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
        ];
    }
}
