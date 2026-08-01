<?php

namespace App\Http\Requests\Operators;

use App\Enums\AccessLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOperatorRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id', 'unique:operators,user_id'],
            'password' => ['required', 'string', 'min:8'],
            'access_level' => ['sometimes', 'integer', Rule::in(AccessLevel::values())],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $userId = $this->input('user_id');

            if (! $userId) {
                return;
            }

            $userIsActive = DB::table('users')
                ->where('id', $userId)
                ->where('active', true)
                ->exists();

            if (! $userIsActive) {
                $validator->errors()->add('user_id', 'A operator can only be created for an active user.');
            }
        });
    }
}
