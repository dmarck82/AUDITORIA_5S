<?php

namespace App\Http\Requests\EvaluationModelOptions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvaluationModelOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('value') && $this->input('value') !== null) {
            $this->merge([
                'value' => trim((string) $this->input('value')),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'evaluation_model_id' => ['required', 'integer', 'exists:evaluation_models,id'],
            'value' => [
                'required',
                'string',
                'max:80',
                Rule::unique('evaluation_model_options', 'value')->where(fn ($query) => $query->where('evaluation_model_id', $this->integer('evaluation_model_id'))),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
