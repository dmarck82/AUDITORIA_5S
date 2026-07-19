<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriterionListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluation_dimension_id' => $this->evaluation_dimension_id,
            'evaluation_dimension_code' => $this->whenLoaded('evaluationDimension', fn () => $this->evaluationDimension?->code),
            'evaluation_dimension_name' => $this->whenLoaded('evaluationDimension', fn () => $this->evaluationDimension?->name),
            'methodology_code' => $this->whenLoaded('evaluationDimension', fn () => $this->evaluationDimension?->methodology?->code),
            'methodology_name' => $this->whenLoaded('evaluationDimension', fn () => $this->evaluationDimension?->methodology?->name),
            'evaluation_model_id' => $this->evaluation_model_id,
            'evaluation_model_code' => $this->whenLoaded('evaluationModel', fn () => $this->evaluationModel?->code),
            'evaluation_model_name' => $this->whenLoaded('evaluationModel', fn () => $this->evaluationModel?->name),
            'code' => $this->code,
            'text' => $this->text,
            'description' => $this->description,
            'active' => $this->active,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
