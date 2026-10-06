<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SendOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['in:email,whatsapp,postbode'],
            'email' => ['nullable', 'email', 'max:255'],
            'message' => ['nullable', 'string'],
            'template' => ['nullable', 'string'],
            'legal_document_ids' => ['nullable', 'array'],
            'legal_document_ids.*' => ['integer', 'exists:company_legal_documents,id'],
            'registered' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $channels = $this->input('channels', []);
            if (in_array('email', $channels, true) && ! filled($this->input('email'))) {
                $validator->errors()->add('email', 'Email is required when sending by email.');
            }
        });
    }
}
