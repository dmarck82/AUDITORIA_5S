<?php

namespace App\Http\Requests\VerificationCriteria;

use App\Enums\FiveSSense;
use App\Enums\ResponseScore;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVerificationCriterionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $labels = [];

        foreach (ResponseScore::cases() as $score) {
            $field = $score->fieldName();
            $label = trim((string) $this->input($field, ''));
            $labels[$field] = $label !== '' ? $label : $score->defaultLabel();
        }

        $this->merge($labels);
    }

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'code' => ['prohibited'],
            'sense' => ['required', Rule::enum(FiveSSense::class)],
            'question' => ['required', 'string', 'max:2000'],
            'response_0_label' => ['required', 'string', 'max:500'],
            'response_5_label' => ['required', 'string', 'max:500'],
            'response_10_label' => ['required', 'string', 'max:500'],
            'response_15_label' => ['required', 'string', 'max:500'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
