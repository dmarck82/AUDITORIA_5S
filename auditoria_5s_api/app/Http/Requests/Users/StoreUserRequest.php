<?php

namespace App\Http\Requests\Users;

use App\Enums\AccessLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
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
            'person_id' => ['required', 'integer', 'exists:people,id', 'unique:users,person_id'],
            'password' => ['required', 'string', 'min:8'],
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
                $validator->errors()->add('person_id', 'A user can only be created for an active person.');
            }
        });
    }
}
