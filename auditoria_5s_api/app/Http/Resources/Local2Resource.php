<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Local2Resource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'local_1_id' => $this->local_1_id,
            'local_1_name' => $this->whenLoaded('local1', fn () => $this->local1?->name),
            'name' => $this->name,
            'address' => $this->address,
            'active' => $this->active,
            'local3s' => Local3Resource::collection($this->whenLoaded('local3s')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
