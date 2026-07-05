<?php

namespace App\Http\Requests\Assessments;

use App\Http\Requests\Assessments\Concerns\ValidatesAssessmentData;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
{
    use ValidatesAssessmentData;

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
            'questionnaire_id' => ['required', 'integer', 'exists:questionnaires,id'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'sector_id' => ['nullable', 'integer', 'exists:sectors,id'],
            'person_id' => ['required', 'integer', 'exists:people,id'],
            'title' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'string', 'max:80'],
            'expires_at' => ['nullable', 'date'],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): mixed
    {
        $data = parent::validated($key, $default);

        if (is_array($data)) {
            $data['status'] ??= 'DRAFT';
        }

        return $data;
    }
}
