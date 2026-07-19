<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessListResource extends JsonResource
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
            'active' => $this->active,
            'sector' => new SectorListResource($this->whenLoaded('sector')),
            'activities_count' => $this->whenCounted('activities'),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
