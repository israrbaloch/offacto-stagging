<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
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
        $company = $this->user()->activeCompany();

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('companies', 'email')->ignore($company?->id)],
            'phone' => ['required', 'string', 'max:255', Rule::unique('companies', 'phone')->ignore($company?->id)],
            'vat_number' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'street' => ['required', 'string', 'max:255'],
            'house' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'language' => ['required', 'exists:languages,id'],
            'self_employed_activity' => ['nullable', 'in:main_profession,secondary_profession'],
        ];
    }
}
