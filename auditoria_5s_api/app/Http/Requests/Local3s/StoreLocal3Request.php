<?php

namespace App\Http\Requests\Local3s;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocal3Request extends FormRequest
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
            'local_2_id' => ['required', 'integer', 'exists:local_2s,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
