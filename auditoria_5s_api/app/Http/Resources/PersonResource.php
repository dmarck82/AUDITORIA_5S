<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'has_photo' => filled($this->photo_path),
            'organization_id' => $this->organization_id,
            'unit_id' => $this->unit_id,
            'sector_id' => $this->sector_id,
            'job_title' => $this->job_title,
            'active' => $this->active,
            'organization' => new OrganizationResource($this->whenLoaded('organization')),
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'sector' => new SectorResource($this->whenLoaded('sector')),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
