<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class StoreRegistrationWithCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => ['required', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'email_company' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'vat_number' => ['required', 'string', 'max:255'],
            'legal_form' => ['required', 'string', 'in:vzw,bv,sole_trader,nv'],
            'vat_regime' => ['required', 'string', 'in:small_business_exemption,vat_registered,exempt_art44'],
            'street' => ['nullable', 'string', 'max:255'],
            'house' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'language' => ['nullable', 'exists:languages,id'],
            'self_employed_activity' => ['nullable', 'in:main_profession,secondary_profession'],
            'theme_primary' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'invoice_logo' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
            'legal_document_privacy' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'legal_document_terms' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'legal_document_dpa' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'legal_document_other' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
