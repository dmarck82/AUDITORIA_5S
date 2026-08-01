<?php

namespace App\Http\Requests\Supervisions;

use App\Enums\ResponseScore;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveSupervisionAnswersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.id' => ['required', 'integer', 'distinct', 'exists:supervision_answers,id'],
            'answers.*.selected_value' => ['nullable', 'integer', Rule::in(ResponseScore::values())],
            'answers.*.not_applicable' => ['required', 'boolean'],
            'answers.*.observation' => ['nullable', 'string', 'max:5000'],
            'answers.*.evidence' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /** @return array<callable> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            foreach ($this->input('answers', []) as $index => $answer) {
                $notApplicable = (bool) ($answer['not_applicable'] ?? false);
                $value = $answer['selected_value'] ?? null;

                if ($notApplicable && $value !== null) {
                    $validator->errors()->add(
                        "answers.{$index}.selected_value",
                        'A not applicable answer cannot have a numeric value.'
                    );
                }

                if (! $notApplicable
                    && $value !== null
                    && in_array((int) $value, [0, 5], true)
                    && trim((string) ($answer['observation'] ?? '')) === '') {
                    $validator->errors()->add(
                        "answers.{$index}.observation",
                        'Observation is required for answers with value 0 or 5.'
                    );
                }
            }
        }];
    }
}
