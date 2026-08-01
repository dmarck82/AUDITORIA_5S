<?php

namespace App\Http\Requests\Local2s;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocal2Request extends FormRequest
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
            'local_1_id' => ['required', 'integer', 'exists:local_1s,id'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
