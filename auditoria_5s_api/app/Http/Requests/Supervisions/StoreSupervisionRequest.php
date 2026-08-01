<?php

namespace App\Http\Requests\Supervisions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupervisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'work_environment_id' => [
                'required',
                'integer',
                Rule::exists('work_environments', 'id')->where('active', true),
            ],
            'responsible_user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('active', true),
            ],
        ];
    }
}
