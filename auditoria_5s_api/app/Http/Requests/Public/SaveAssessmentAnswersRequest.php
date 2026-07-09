<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class SaveAssessmentAnswersRequest extends FormRequest
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
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.score' => ['required', 'integer', 'between:1,5'],
            'answers.*.observation' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
