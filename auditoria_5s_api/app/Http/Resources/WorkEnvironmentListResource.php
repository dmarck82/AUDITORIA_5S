<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkEnvironmentListResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'local_3_id' => $this->local_3_id,
            'name' => $this->name,
            'active' => $this->active,
            'verification_criteria_count' => $this->whenCounted('verificationCriteria'),
            'active_verification_criteria_count' => $this->when(isset($this->active_verification_criteria_count), fn () => (int) $this->active_verification_criteria_count),
            'local3' => new Local3ListResource($this->whenLoaded('local3')),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
