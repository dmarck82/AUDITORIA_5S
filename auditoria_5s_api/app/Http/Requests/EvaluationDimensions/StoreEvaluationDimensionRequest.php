<?php

namespace App\Http\Requests\EvaluationDimensions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvaluationDimensionRequest extends FormRequest
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
            'methodology_id' => ['required', 'integer', 'exists:methodologies,id'],
            'code' => [
                'required',
                'string',
                'max:80',
                Rule::unique('evaluation_dimensions', 'code')->where(fn ($query) => $query->where('methodology_id', $this->integer('methodology_id'))),
            ],
            'name' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
