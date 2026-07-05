<?php

namespace App\Http\Requests\Users;

use App\Enums\AccessLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('user')?->id;

        return [
            'person_id' => ['required', 'integer', 'exists:people,id', Rule::unique('users', 'person_id')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'access_level' => ['sometimes', 'integer', Rule::in(AccessLevel::values())],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $personId = $this->input('person_id');

            if (!$personId) {
                return;
            }

            $personIsActive = DB::table('people')
                ->where('id', $personId)
                ->where('active', true)
                ->exists();

            if (!$personIsActive) {
                $validator->errors()->add('person_id', 'A user can only be linked to an active person.');
            }
        });
    }
}
