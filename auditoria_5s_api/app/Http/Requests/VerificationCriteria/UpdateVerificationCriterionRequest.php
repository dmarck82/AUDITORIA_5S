<?php

namespace App\Http\Requests\VerificationCriteria;

class UpdateVerificationCriterionRequest extends StoreVerificationCriterionRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['code'] = ['prohibited'];
        $rules['sense'] = ['prohibited'];

        return $rules;
    }
}
