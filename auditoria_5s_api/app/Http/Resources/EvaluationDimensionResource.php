<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationDimensionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'methodology_id' => $this->methodology_id,
            'methodology' => $this->whenLoaded('methodology', fn () => new MethodologyListResource($this->methodology)),
            'code' => $this->code,
            'name' => $this->name,
            'objective' => $this->objective,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
