<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkEnvironmentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'local_3_id' => $this->local_3_id,
            'name' => $this->name,
            'description' => $this->description,
            'active' => $this->active,
            'verification_criteria_count' => $this->whenCounted('verificationCriteria'),
            'active_verification_criteria_count' => $this->when(isset($this->active_verification_criteria_count), fn () => (int) $this->active_verification_criteria_count),
            'local3' => new Local3Resource($this->whenLoaded('local3')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
