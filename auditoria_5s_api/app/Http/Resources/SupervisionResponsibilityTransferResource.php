<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisionResponsibilityTransferResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_user_id' => $this->from_user_id,
            'from_user_name' => $this->from_user_name_snapshot,
            'to_user_id' => $this->to_user_id,
            'to_user_name' => $this->to_user_name_snapshot,
            'assumed_by_operator_id' => $this->assumed_by_operator_id,
            'assumed_by_name' => $this->assumed_by_name_snapshot,
            'justification' => $this->justification,
            'created_at' => $this->created_at,
        ];
    }
}
