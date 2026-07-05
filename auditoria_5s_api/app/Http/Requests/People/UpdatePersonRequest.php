<?php

namespace App\Http\Requests\People;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdatePersonRequest extends FormRequest
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
        $personId = $this->route('person')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('people', 'email')->ignore($personId)],
            'phone' => ['nullable', 'string', 'digits:11', Rule::unique('people', 'phone')->ignore($personId)],
            'photo' => ['nullable', 'image', 'max:2048'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $organizationId = $this->input('organization_id');
            $unitId = $this->input('unit_id');
            $sectorId = $this->input('sector_id');

            if (!$unitId && $sectorId) {
                $validator->errors()->add('sector_id', 'A sector cannot be selected without a unit.');

                return;
            }

            if ($organizationId && $unitId) {
                $unitBelongsToOrganization = DB::table('units')
                    ->where('id', $unitId)
                    ->where('organization_id', $organizationId)
                    ->exists();

                if (!$unitBelongsToOrganization) {
                    $validator->errors()->add('unit_id', 'The selected unit does not belong to the selected organization.');
                }
            }

            if ($unitId && $sectorId) {
                $sectorBelongsToUnit = DB::table('sectors')
                    ->where('id', $sectorId)
                    ->where('unit_id', $unitId)
                    ->exists();

                if (!$sectorBelongsToUnit) {
                    $validator->errors()->add('sector_id', 'The selected sector does not belong to the selected unit.');
                }
            }
        });
    }
}
