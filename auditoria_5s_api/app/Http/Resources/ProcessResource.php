<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sector_id' => $this->sector_id,
            'name' => $this->name,
            'description' => $this->description,
            'active' => $this->active,
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'activities' => ActivityResource::collection($this->whenLoaded('activities')),
            'activities_count' => $this->whenCounted('activities'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
