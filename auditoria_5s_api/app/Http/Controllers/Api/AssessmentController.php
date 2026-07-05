<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessments\StoreAssessmentRequest;
use App\Http\Requests\Assessments\UpdateAssessmentRequest;
use App\Http\Resources\AssessmentListResource;
use App\Http\Resources\AssessmentResource;
use App\Http\Resources\AssessmentStatusResource;
use App\Models\Assessment;
use App\Models\GenericTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class AssessmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return AssessmentListResource::collection(
            Assessment::query()
                ->with([
                    'questionnaire:id,name,description,active',
                    'organization:id,name,active',
                    'unit:id,organization_id,name,active',
                    'sector:id,unit_id,name,active',
                    'person:id,name,email,phone,organization_id,unit_id,sector_id,active',
                    'updatedBy.person',
                ])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreAssessmentRequest $request): AssessmentResource
    {
        $assessment = Assessment::create($request->validated());

        return new AssessmentResource($assessment->load($this->relations()));
    }

    public function show(Assessment $assessment): AssessmentResource
    {
        return new AssessmentResource($assessment->load($this->relations()));
    }

    public function update(UpdateAssessmentRequest $request, Assessment $assessment): AssessmentResource
    {
        $assessment->update($request->validated());

        return new AssessmentResource($assessment->load($this->relations()));
    }

    public function destroy(Assessment $assessment): Response|JsonResponse
    {
        if ($assessment->status === 'COMPLETED') {
            return response()->json([
                'message' => 'Completed assessments cannot be deleted.',
            ], 409);
        }

        $assessment->delete();

        return response()->noContent();
    }

    public function statuses(): AnonymousResourceCollection
    {
        $statuses = GenericTable::query()
            ->where('code', 'ASSESSMENT_STATUS')
            ->where('active', true)
            ->firstOrFail()
            ->items()
            ->where('active', true)
            ->orderBy('sort_order')
            ->get();

        return AssessmentStatusResource::collection($statuses);
    }

    /**
     * @return array<string>
     */
    private function relations(): array
    {
        return [
            'questionnaire',
            'organization',
            'unit',
            'sector',
            'person.organization',
            'person.unit',
            'person.sector',
            'createdBy.person',
            'updatedBy.person',
        ];
    }
}
