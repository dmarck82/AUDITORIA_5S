<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkEnvironments\SyncWorkEnvironmentCriteriaRequest;
use App\Models\VerificationCriterion;
use App\Models\WorkEnvironment;
use Illuminate\Http\JsonResponse;

class WorkEnvironmentCriteriaController extends Controller
{
    public function index(WorkEnvironment $workEnvironment): JsonResponse
    {
        return $this->response($workEnvironment);
    }

    public function update(
        SyncWorkEnvironmentCriteriaRequest $request,
        WorkEnvironment $workEnvironment
    ): JsonResponse {
        $workEnvironment->verificationCriteria()->sync(
            $request->validated()['criterion_ids']
        );
        $workEnvironment->touch();

        return $this->response($workEnvironment);
    }

    private function response(WorkEnvironment $workEnvironment): JsonResponse
    {
        $workEnvironment->loadMissing('local3.local2.local1');
        $linkedIds = $workEnvironment->verificationCriteria()
            ->pluck('verification_criteria.id')
            ->map(fn ($id): int => (int) $id)
            ->flip();
        $criteria = VerificationCriterion::query()
            ->orderBy('sense')
            ->orderBy('code')
            ->get();

        return response()->json([
            'data' => [
                'work_environment' => [
                    'id' => $workEnvironment->id,
                    'name' => $workEnvironment->name,
                    'active' => $workEnvironment->active,
                    'local_1_name' => $workEnvironment->local3->local2->local1->name,
                    'local_2_name' => $workEnvironment->local3->local2->name,
                    'local_3_name' => $workEnvironment->local3->name,
                ],
                'criteria' => $criteria->map(fn (VerificationCriterion $criterion): array => [
                    'id' => $criterion->id,
                    'code' => $criterion->code,
                    'sense' => $criterion->sense->value,
                    'sense_label' => $criterion->sense->label(),
                    'question' => $criterion->question,
                    'active' => $criterion->active,
                    'linked' => $linkedIds->has($criterion->id),
                ])->values(),
            ],
        ]);
    }
}
