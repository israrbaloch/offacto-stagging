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
            'offer_date' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:offer_date'],
            'intro' => ['required', 'string'],
            'desc' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'status' => [
                'required',
                'integer',
                Rule::exists('status', 'id')->where('for', 'offers'),
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
        ];
    }
}
