<?php

namespace App\Http\Requests\WorkEnvironments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkEnvironmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'local_3_id' => ['required', 'integer', 'exists:local_3s,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('work_environments')->where(
                    fn ($query) => $query->where('local_3_id', $this->integer('local_3_id'))
                ),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
