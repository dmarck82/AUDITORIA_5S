<?php

namespace App\Http\Requests\Assessments\Concerns;

use App\Models\Assessment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

trait ValidatesAssessmentData
{
    protected function prepareForValidation(): void
    {
        if ($this->has('status') && $this->input('status')) {
            $this->merge([
                'status' => strtoupper((string) $this->input('status')),
            ]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateStatus($validator);
            $this->validateQuestionnaire($validator);
            $this->validateOrganization($validator);
            $this->validatePerson($validator);
            $this->validateUnitAndSector($validator);
            $this->validateQuestionnaireChange($validator);
        });
    }

    private function validateStatus(Validator $validator): void
    {
        $status = $this->input('status', 'DRAFT');

        if (!$status) {
            return;
        }

        $statusExists = DB::table('generic_table_items')
            ->join('generic_tables', 'generic_tables.id', '=', 'generic_table_items.generic_table_id')
            ->where('generic_tables.code', 'ASSESSMENT_STATUS')
            ->where('generic_tables.active', true)
            ->where('generic_table_items.code', $status)
            ->where('generic_table_items.active', true)
            ->exists();

        if (!$statusExists) {
            $validator->errors()->add('status', 'The selected status is invalid.');
        }
    }

    private function validateQuestionnaire(Validator $validator): void
    {
        $questionnaireId = $this->input('questionnaire_id');

        if (!$questionnaireId) {
            return;
        }

        $questionnaireIsActive = DB::table('questionnaires')
            ->where('id', $questionnaireId)
            ->where('active', true)
            ->exists();

        if (!$questionnaireIsActive) {
            $validator->errors()->add('questionnaire_id', 'The selected questionnaire must be active.');
        }
    }

    private function validateOrganization(Validator $validator): void
    {
        $organizationId = $this->input('organization_id');

        if (!$organizationId) {
            return;
        }

        $organizationIsActive = DB::table('organizations')
            ->where('id', $organizationId)
            ->where('active', true)
            ->exists();

        if (!$organizationIsActive) {
            $validator->errors()->add('organization_id', 'The selected organization must be active.');
        }
    }

    private function validatePerson(Validator $validator): void
    {
        $organizationId = $this->input('organization_id');
        $personId = $this->input('person_id');

        if (!$organizationId || !$personId) {
            return;
        }

        $person = DB::table('people')
            ->where('id', $personId)
            ->first();

        if (!$person || !$person->active) {
            $validator->errors()->add('person_id', 'The selected person must be active.');

            return;
        }

        if ((int) $person->organization_id !== (int) $organizationId) {
            $validator->errors()->add('person_id', 'The selected person does not belong to the selected organization.');
        }

        $unitId = $this->input('unit_id');
        $sectorId = $this->input('sector_id');

        if ($unitId && $person->unit_id && (int) $person->unit_id !== (int) $unitId) {
            $validator->errors()->add('person_id', 'The selected person is not compatible with the selected unit.');
        }

        if ($sectorId && $person->sector_id && (int) $person->sector_id !== (int) $sectorId) {
            $validator->errors()->add('person_id', 'The selected person is not compatible with the selected sector.');
        }
    }

    private function validateUnitAndSector(Validator $validator): void
    {
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
    }

    private function validateQuestionnaireChange(Validator $validator): void
    {
        $assessment = $this->route('assessment');

        if (!$assessment instanceof Assessment || $assessment->status === 'DRAFT') {
            return;
        }

        $questionnaireId = $this->input('questionnaire_id');

        if ($questionnaireId && (int) $questionnaireId !== (int) $assessment->questionnaire_id) {
            $validator->errors()->add('questionnaire_id', 'The questionnaire cannot be changed after the assessment leaves draft status.');
        }
    }
}
