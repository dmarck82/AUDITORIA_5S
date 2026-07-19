<?php

namespace App\Http\Requests\Activities;

use Illuminate\Foundation\Http\FormRequest;

class ReorderActivitiesRequest extends FormRequest
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
            'process_id' => ['required', 'integer', 'exists:processes,id'],
            'activities' => ['required', 'array', 'min:1'],
            'activities.*' => ['required', 'integer', 'distinct', 'exists:activities,id'],
        ];
    }
}
