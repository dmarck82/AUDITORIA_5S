<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationDimensionListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'methodology_id' => $this->methodology_id,
            'methodology_name' => $this->whenLoaded('methodology', fn () => $this->methodology?->name),
            'methodology_code' => $this->whenLoaded('methodology', fn () => $this->methodology?->code),
            'code' => $this->code,
            'name' => $this->name,
            'objective' => $this->objective,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
