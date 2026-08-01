<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserListResource extends JsonResource
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
            'local_1_id' => $this->local_1_id,
            'local_2_id' => $this->local_2_id,
            'local_3_id' => $this->local_3_id,
            'active' => $this->active,
            'local1' => new Local1ListResource($this->whenLoaded('local1')),
            'local2' => new Local2ListResource($this->whenLoaded('local2')),
            'local3' => new Local3ListResource($this->whenLoaded('local3')),
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
