<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VerificationCriterionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'sense' => $this->sense->value,
            'sense_label' => $this->sense->label(),
            'question' => $this->question,
            'response_0_label' => $this->response_0_label,
            'response_5_label' => $this->response_5_label,
            'response_10_label' => $this->response_10_label,
            'response_15_label' => $this->response_15_label,
            'response_options' => $this->responseOptions(),
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
