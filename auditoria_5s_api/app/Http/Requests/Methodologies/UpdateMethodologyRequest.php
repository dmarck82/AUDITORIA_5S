<?php

namespace App\Http\Requests\Methodologies;

use Illuminate\Validation\Rule;

class UpdateMethodologyRequest extends StoreMethodologyRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $methodologyId = $this->route('methodology')?->id;

        return [
            'code' => ['required', 'string', 'max:80', Rule::unique('methodologies', 'code')->ignore($methodologyId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
