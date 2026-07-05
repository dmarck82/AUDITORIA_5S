<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonListResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'organization_id' => $this->organization_id,
            'unit_id' => $this->unit_id,
            'sector_id' => $this->sector_id,
            'active' => $this->active,
            'organization' => new OrganizationListResource($this->whenLoaded('organization')),
            'unit' => new UnitListResource($this->whenLoaded('unit')),
            'sector' => new SectorListResource($this->whenLoaded('sector')),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
