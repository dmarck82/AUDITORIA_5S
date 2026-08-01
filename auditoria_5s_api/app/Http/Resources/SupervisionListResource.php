<?php

namespace App\Http\Resources;

use App\Models\Operator;
use App\Services\SupervisionAccessService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisionListResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        /** @var Operator|null $operator */
        $operator = $request->user('api');
        $access = app(SupervisionAccessService::class);

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'work_environment_name' => $this->work_environment_name_snapshot,
            'local_2_name' => $this->local_2_name_snapshot,
            'local_3_name' => $this->local_3_name_snapshot,
            'responsible_user_name' => $this->responsibleUser?->name ?? $this->responsible_user_name_snapshot,
            'operator_name' => $this->operator_name_snapshot,
            'started_at' => $this->started_at,
            'finalized_at' => $this->finalized_at,
            'score' => $this->scoreSummary(),
            'actions' => $operator ? [
                'can_configure' => $access->canConfigure($operator, $this->resource),
                'can_send' => $access->canSend($operator, $this->resource),
                'can_answer' => $access->canAnswer($operator, $this->resource),
                'can_submit' => $access->canSubmit($operator, $this->resource),
                'can_finalize' => $access->canFinalize($operator, $this->resource),
                'can_assume' => $access->canAssume($operator, $this->resource),
                'can_delete' => $access->canDelete($operator, $this->resource),
            ] : [],
        ];
    }
}
