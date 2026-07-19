<?php

namespace App\Http\Requests\EvaluationModelOptions;

use Illuminate\Foundation\Http\FormRequest;

class ReorderEvaluationModelOptionsRequest extends FormRequest
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
            'evaluation_model_id' => ['required', 'integer', 'exists:evaluation_models,id'],
            'options' => ['required', 'array', 'min:1'],
            'options.*' => ['required', 'integer', 'distinct', 'exists:evaluation_model_options,id'],
        ];
    }
}
