<?php

namespace App\Http\Requests\Questions;

use App\Http\Requests\Questions\Concerns\ValidatesQuestionCategory;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    use ValidatesQuestionCategory;

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
            'category' => ['required', 'string', 'max:80'],
            'question' => ['required', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
