<?php

namespace App\Http\Requests;

use App\Models\BriefingQuestion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBriefingRequest extends FormRequest
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
    }

    public function rules(): array
    {
        $companyId = $this->user()?->activeCompany()?->id;

        return [
            'title' => ['nullable', 'string', 'max:255'],
            'intro' => ['nullable', 'string'],
            'customer_id' => [
                'nullable',
                'integer',
                Rule::exists('customers', 'id')->where('company_id', $companyId),
            ],
            'auto_generate_offer' => ['sometimes', 'boolean'],
            'valid_until_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'closed'])],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'integer'],
            'questions.*.type' => ['required', Rule::in(array_keys(BriefingQuestion::types()))],
            'questions.*.label' => ['required', 'string', 'max:255'],
            'questions.*.help_text' => ['nullable', 'string'],
            'questions.*.required' => ['sometimes', 'boolean'],
            'questions.*.service_id' => [
                'nullable',
                'integer',
                Rule::exists('services', 'id')->where('company_id', $companyId),
            ],
            'questions.*.price_override' => ['nullable', 'numeric', 'min:0'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*.label' => ['required_with:questions.*.options', 'string', 'max:255'],
            'questions.*.options.*.price' => ['nullable', 'numeric', 'min:0'],
            'questions.*.options.*.service_id' => ['nullable', 'integer'],
        ];
    }
}
