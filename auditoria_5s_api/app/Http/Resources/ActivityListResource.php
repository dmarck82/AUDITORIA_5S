<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'process_id' => $this->process_id,
            'name' => $this->name,
            'sort_order' => $this->sort_order,
            'active' => $this->active,
            'process' => new ProcessListResource($this->whenLoaded('process')),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
