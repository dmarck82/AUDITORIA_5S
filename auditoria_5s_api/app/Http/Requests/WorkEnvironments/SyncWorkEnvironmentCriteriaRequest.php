<?php

namespace App\Http\Requests\WorkEnvironments;

use Illuminate\Foundation\Http\FormRequest;

class SyncWorkEnvironmentCriteriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'criterion_ids' => ['required', 'array'],
            'criterion_ids.*' => [
                'integer',
                'distinct',
                'exists:verification_criteria,id',
            ],
        ];
    }
}
