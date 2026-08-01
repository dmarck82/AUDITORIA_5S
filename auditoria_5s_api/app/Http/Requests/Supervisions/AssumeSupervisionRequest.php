<?php

namespace App\Http\Requests\Supervisions;

use Illuminate\Foundation\Http\FormRequest;

class AssumeSupervisionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'justification' => trim((string) $this->input('justification', '')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'justification' => ['required', 'string', 'max:5000'],
        ];
    }
}
