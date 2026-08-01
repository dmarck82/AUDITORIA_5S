<?php

namespace App\Http\Requests\WorkEnvironments;

use Illuminate\Validation\Rule;

class UpdateWorkEnvironmentRequest extends StoreWorkEnvironmentRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        $workEnvironment = $this->route('workEnvironment');

        $rules['name'] = [
            'required',
            'string',
            'max:255',
            Rule::unique('work_environments')
                ->where(fn ($query) => $query->where('local_3_id', $this->integer('local_3_id')))
                ->ignore($workEnvironment),
        ];

        return $rules;
    }
}
