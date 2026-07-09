<?php

namespace App\Http\Requests\Questions;

use Illuminate\Foundation\Http\FormRequest;

class ReorderQuestionsRequest extends FormRequest
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
            'questionnaire_id' => ['required', 'integer', 'exists:questionnaires,id'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*' => ['required', 'integer', 'distinct', 'exists:questions,id'],
        ];
    }
}
