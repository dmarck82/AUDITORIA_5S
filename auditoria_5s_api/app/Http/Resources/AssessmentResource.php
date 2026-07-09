<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'questionnaire_id' => $this->questionnaire_id,
            'organization_id' => $this->organization_id,
            'unit_id' => $this->unit_id,
            'sector_id' => $this->sector_id,
            'person_id' => $this->person_id,
            'title' => $this->title,
            'status' => $this->status,
            'access_code' => $this->access_code,
            'expires_at' => $this->expires_at,
            'answered_at' => $this->answered_at,
            'active' => $this->active,
            'questionnaire' => new QuestionnaireListResource($this->whenLoaded('questionnaire')),
            'organization' => new OrganizationListResource($this->whenLoaded('organization')),
            'unit' => new UnitListResource($this->whenLoaded('unit')),
            'sector' => new SectorListResource($this->whenLoaded('sector')),
            'person' => new PersonListResource($this->whenLoaded('person')),
            'created_by' => new UserSummaryResource($this->whenLoaded('createdBy')),
            'updated_by' => new UserSummaryResource($this->whenLoaded('updatedBy')),
            'answers' => AssessmentAnswerResource::collection($this->whenLoaded('answers')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
