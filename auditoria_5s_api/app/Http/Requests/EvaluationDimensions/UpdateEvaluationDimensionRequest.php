<?php

namespace App\Http\Requests\EvaluationDimensions;

use Illuminate\Validation\Rule;

class UpdateEvaluationDimensionRequest extends StoreEvaluationDimensionRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $dimensionId = $this->route('evaluationDimension')?->id;
        $methodologyId = $this->integer('methodology_id') ?: $this->route('evaluationDimension')?->methodology_id;

        return [
            'methodology_id' => ['required', 'integer', 'exists:methodologies,id'],
            'code' => [
                'required',
                'string',
                'max:80',
                Rule::unique('evaluation_dimensions', 'code')
                    ->where(fn ($query) => $query->where('methodology_id', $methodologyId))
                    ->ignore($dimensionId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'objective' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
