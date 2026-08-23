<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:organization,individual'],
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'vat_number' => ['nullable', 'string', 'max:255'],
            'org_name' => ['nullable', 'string', 'max:255', 'required_if:type,organization'],
            'office_address' => ['nullable', 'string', 'max:500'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('customers', 'email')->where(function ($query) use ($activeCompany) {
                    return $query->where('company_id', $activeCompany?->id);
                }),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'email_usage' => ['nullable', 'array'],
            'additional_recivers' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'status' => [
                'required',
                'integer',
                Rule::exists('status', 'id')->where('for', 'customers'),
            ],
        ];
    }
}
