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

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'form_locale' => ['nullable', 'string', Rule::in(['auto', 'nl', 'fr', 'en'])],
            'auto_generate_offer' => ['sometimes', 'boolean'],
            'ai_writes_intro' => ['sometimes', 'boolean'],
            'require_nda_before_start' => ['sometimes', 'boolean'],
            'valid_until_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'closed'])],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'integer'],
            'questions.*.type' => ['required', Rule::in(array_keys(BriefingQuestion::types()))],
            'questions.*.label' => ['required', 'string', 'max:255'],
            'questions.*.help_text' => ['nullable', 'string'],
            'questions.*.required' => ['sometimes', 'boolean'],
            'questions.*.price_override' => ['nullable', 'numeric', 'min:0'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*.label' => ['required_with:questions.*.options', 'string', 'max:255'],
            'questions.*.options.*.price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
