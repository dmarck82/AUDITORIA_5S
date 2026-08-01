<?php

namespace App\Http\Requests\Local1s;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocal1Request extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
