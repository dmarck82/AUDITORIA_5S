<?php

namespace App\Http\Requests\EvaluationModelOptions;

use Illuminate\Validation\Rule;

class UpdateEvaluationModelOptionRequest extends StoreEvaluationModelOptionRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $optionId = $this->route('evaluationModelOption')?->id;
        $modelId = $this->integer('evaluation_model_id') ?: $this->route('evaluationModelOption')?->evaluation_model_id;

        return [
            'evaluation_model_id' => ['required', 'integer', 'exists:evaluation_models,id'],
            'value' => [
                'required',
                'string',
                'max:80',
                Rule::unique('evaluation_model_options', 'value')
                    ->where(fn ($query) => $query->where('evaluation_model_id', $modelId))
                    ->ignore($optionId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
