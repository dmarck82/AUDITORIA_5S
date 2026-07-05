<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status,
            'expires_at' => $this->expires_at,
            'active' => $this->active,
            'questionnaire' => new QuestionnaireListResource($this->whenLoaded('questionnaire')),
            'organization' => new OrganizationListResource($this->whenLoaded('organization')),
            'unit' => new UnitListResource($this->whenLoaded('unit')),
            'sector' => new SectorListResource($this->whenLoaded('sector')),
            'person' => new PersonListResource($this->whenLoaded('person')),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
