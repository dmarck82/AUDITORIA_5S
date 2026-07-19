<?php

namespace App\Http\Requests\EvaluationModels;

use Illuminate\Validation\Rule;

class UpdateEvaluationModelRequest extends StoreEvaluationModelRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $modelId = $this->route('evaluationModel')?->id;

        return [
            'code' => ['required', 'string', 'max:80', Rule::unique('evaluation_models', 'code')->ignore($modelId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
