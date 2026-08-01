<?php

namespace App\Http\Resources;

use App\Models\Operator;
use App\Services\SupervisionAccessService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        /** @var Operator|null $operator */
        $operator = $request->user('api');
        $access = app(SupervisionAccessService::class);
        $actions = $operator ? [
            'can_configure' => $access->canConfigure($operator, $this->resource),
            'can_send' => $access->canSend($operator, $this->resource),
            'can_answer' => $access->canAnswer($operator, $this->resource),
            'can_submit' => $access->canSubmit($operator, $this->resource),
            'can_finalize' => $access->canFinalize($operator, $this->resource),
            'can_assume' => $access->canAssume($operator, $this->resource),
            'can_delete' => $access->canDelete($operator, $this->resource),
        ] : [];

        return [
            'id' => $this->id,
            'work_environment_id' => $this->work_environment_id,
            'responsible_user_id' => $this->responsible_user_id,
            'operator_id' => $this->operator_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'actions' => $actions,
            'can_edit' => ($actions['can_configure'] ?? false) || ($actions['can_answer'] ?? false),
            'started_at' => $this->started_at,
            'sent_at' => $this->sent_at,
            'response_started_at' => $this->response_started_at,
            'answered_at' => $this->answered_at,
            'finalized_at' => $this->finalized_at,
            'work_environment_name' => $this->work_environment_name_snapshot,
            'local_1_name' => $this->local_1_name_snapshot,
            'local_2_name' => $this->local_2_name_snapshot,
            'local_3_name' => $this->local_3_name_snapshot,
            'responsible_user_name' => $this->responsibleUser?->name ?? $this->responsible_user_name_snapshot,
            'initial_responsible_user_name' => $this->responsible_user_name_snapshot,
            'operator_name' => $this->operator_name_snapshot,
            'score' => $this->scoreSummary(),
            'scores_by_sense' => $this->scoresBySense(),
            'answers' => SupervisionAnswerResource::collection($this->whenLoaded('answers')),
            'responsibility_transfers' => SupervisionResponsibilityTransferResource::collection(
                $this->whenLoaded('responsibilityTransfers')
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'updated_by' => $this->updated_by,
            'updated_by_name' => $this->whenLoaded('updatedBy', fn () => $this->updatedBy?->name),
        ];
    }
}
