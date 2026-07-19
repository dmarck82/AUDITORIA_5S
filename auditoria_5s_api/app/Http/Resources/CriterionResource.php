<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CriterionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluation_dimension_id' => $this->evaluation_dimension_id,
            'evaluation_dimension' => $this->whenLoaded('evaluationDimension', fn () => new EvaluationDimensionListResource($this->evaluationDimension)),
            'evaluation_model_id' => $this->evaluation_model_id,
            'evaluation_model' => $this->whenLoaded('evaluationModel', fn () => new EvaluationModelListResource($this->evaluationModel)),
            'code' => $this->code,
            'text' => $this->text,
            'description' => $this->description,
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
