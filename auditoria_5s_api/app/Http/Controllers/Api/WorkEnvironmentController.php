<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WorkEnvironments\StoreWorkEnvironmentRequest;
use App\Http\Requests\WorkEnvironments\UpdateWorkEnvironmentRequest;
use App\Http\Resources\WorkEnvironmentListResource;
use App\Http\Resources\WorkEnvironmentResource;
use App\Models\WorkEnvironment;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class WorkEnvironmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return WorkEnvironmentListResource::collection(
            WorkEnvironment::query()
                ->with(['local3.local2.local1', 'updatedBy.user'])
                ->withCount([
                    'verificationCriteria',
                    'verificationCriteria as active_verification_criteria_count' => fn ($query) => $query->where('verification_criteria.active', true),
                ])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreWorkEnvironmentRequest $request): WorkEnvironmentResource
    {
        $workEnvironment = WorkEnvironment::create($request->validated());

        return new WorkEnvironmentResource(
            $workEnvironment->load(['local3.local2.local1', 'updatedBy.user'])
                ->loadCount([
                    'verificationCriteria',
                    'verificationCriteria as active_verification_criteria_count' => fn ($query) => $query->where('verification_criteria.active', true),
                ])
        );
    }

    public function show(WorkEnvironment $workEnvironment): WorkEnvironmentResource
    {
        return new WorkEnvironmentResource(
            $workEnvironment->load(['local3.local2.local1', 'updatedBy.user'])
                ->loadCount([
                    'verificationCriteria',
                    'verificationCriteria as active_verification_criteria_count' => fn ($query) => $query->where('verification_criteria.active', true),
                ])
        );
    }

    public function update(
        UpdateWorkEnvironmentRequest $request,
        WorkEnvironment $workEnvironment
    ): WorkEnvironmentResource {
        $workEnvironment->update($request->validated());

        return new WorkEnvironmentResource(
            $workEnvironment->load(['local3.local2.local1', 'updatedBy.user'])
                ->loadCount([
                    'verificationCriteria',
                    'verificationCriteria as active_verification_criteria_count' => fn ($query) => $query->where('verification_criteria.active', true),
                ])
        );
    }

    public function destroy(WorkEnvironment $workEnvironment): Response
    {
        $workEnvironment->delete();

        return response()->noContent();
    }
}
