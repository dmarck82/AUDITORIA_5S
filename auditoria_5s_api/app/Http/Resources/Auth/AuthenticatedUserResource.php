<?php

namespace App\Http\Resources\Auth;

use App\Enums\AccessLevel;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthenticatedUserResource extends JsonResource
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
            'name' => $this->person?->name ?? 'User',
            'access_level' => $this->access_level,
            'access_level_name' => AccessLevel::tryFrom((int) $this->access_level)?->name,
        ];
    }
}
