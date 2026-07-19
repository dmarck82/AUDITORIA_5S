<?php

namespace App\Http\Requests\Criteria;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('code') && $this->input('code')) {
            $this->merge([
                'code' => strtoupper(trim((string) $this->input('code'))),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'evaluation_dimension_id' => ['required', 'integer', 'exists:evaluation_dimensions,id'],
            'evaluation_model_id' => ['required', 'integer', 'exists:evaluation_models,id'],
            'code' => ['nullable', 'string', 'max:80', Rule::unique('criteria', 'code')],
            'text' => ['required', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
