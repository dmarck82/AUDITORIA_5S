<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisionAnswerResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'verification_criterion_id' => $this->verification_criterion_id,
            'criterion_code' => $this->criterion_code_snapshot,
            'sense' => $this->sense_snapshot->value,
            'sense_label' => $this->sense_snapshot->label(),
            'question' => $this->criterion_question_snapshot,
            'response_options' => $this->responseOptions(),
            'selected_value' => $this->selected_value,
            'not_applicable' => $this->not_applicable,
            'observation' => $this->observation,
            'evidence' => $this->evidence,
            'is_nonconformity' => $this->isNonconformity(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
