<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'local_1_id' => $this->local_1_id,
            'local_2_id' => $this->local_2_id,
            'local_3_id' => $this->local_3_id,
            'job_title' => $this->job_title,
            'active' => $this->active,
            'local1' => new Local1Resource($this->whenLoaded('local1')),
            'local2' => new Local2Resource($this->whenLoaded('local2')),
            'local3' => new Local3Resource($this->whenLoaded('local3')),
            'operator' => new OperatorResource($this->whenLoaded('operator')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
