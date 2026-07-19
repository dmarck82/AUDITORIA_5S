<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationModelOptionListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluation_model_id' => $this->evaluation_model_id,
            'evaluation_model_code' => $this->whenLoaded('evaluationModel', fn () => $this->evaluationModel?->code),
            'evaluation_model_name' => $this->whenLoaded('evaluationModel', fn () => $this->evaluationModel?->name),
            'value' => $this->value,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
