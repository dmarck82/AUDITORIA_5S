<?php

namespace App\Http\Requests\EvaluationDimensions;

use Illuminate\Foundation\Http\FormRequest;

class ReorderEvaluationDimensionsRequest extends FormRequest
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
            'methodology_id' => ['required', 'integer', 'exists:methodologies,id'],
            'dimensions' => ['required', 'array', 'min:1'],
            'dimensions.*' => ['required', 'integer', 'distinct', 'exists:evaluation_dimensions,id'],
        ];
    }
}
