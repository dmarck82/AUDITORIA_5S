<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'digits:11', 'unique:users,phone'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'local_1_id' => ['required', 'integer', 'exists:local_1s,id'],
            'local_2_id' => ['nullable', 'integer', 'exists:local_2s,id'],
            'local_3_id' => ['nullable', 'integer', 'exists:local_3s,id'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $local1Id = $this->input('local_1_id');
            $local2Id = $this->input('local_2_id');
            $local3Id = $this->input('local_3_id');

            if (! $local2Id && $local3Id) {
                $validator->errors()->add('local_3_id', 'A local3 cannot be selected without a local2.');

                return;
            }

            if ($local1Id && $local2Id) {
                $local2BelongsToLocal1 = DB::table('local_2s')
                    ->where('id', $local2Id)
                    ->where('local_1_id', $local1Id)
                    ->exists();

                if (! $local2BelongsToLocal1) {
                    $validator->errors()->add('local_2_id', 'The selected local2 does not belong to the selected local1.');
                }
            }

            if ($local2Id && $local3Id) {
                $local3BelongsToLocal2 = DB::table('local_3s')
                    ->where('id', $local3Id)
                    ->where('local_2_id', $local2Id)
                    ->exists();

                if (! $local3BelongsToLocal2) {
                    $validator->errors()->add('local_3_id', 'The selected local3 does not belong to the selected local2.');
                }
            }
        });
    }
}
