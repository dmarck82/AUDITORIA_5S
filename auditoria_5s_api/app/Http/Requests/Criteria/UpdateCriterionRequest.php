<?php

namespace App\Http\Requests\Criteria;

use Illuminate\Validation\Rule;

class UpdateCriterionRequest extends StoreCriterionRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $criterionId = $this->route('criterion')?->id;

        return [
            'evaluation_dimension_id' => ['required', 'integer', 'exists:evaluation_dimensions,id'],
            'evaluation_model_id' => ['required', 'integer', 'exists:evaluation_models,id'],
            'code' => ['required', 'string', 'max:80', Rule::unique('criteria', 'code')->ignore($criterionId)],
            'text' => ['required', 'string', 'max:2000'],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
