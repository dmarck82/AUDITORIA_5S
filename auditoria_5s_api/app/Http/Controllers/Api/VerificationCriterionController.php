<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VerificationCriteria\StoreVerificationCriterionRequest;
use App\Http\Requests\VerificationCriteria\UpdateVerificationCriterionRequest;
use App\Http\Resources\VerificationCriterionListResource;
use App\Http\Resources\VerificationCriterionResource;
use App\Models\VerificationCriterion;
use App\Services\VerificationCriterionService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class VerificationCriterionController extends Controller
{
    public function __construct(private readonly VerificationCriterionService $service) {}

    public function index(): AnonymousResourceCollection
    {
        return VerificationCriterionListResource::collection(
            VerificationCriterion::query()
                ->with('updatedBy.user')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreVerificationCriterionRequest $request): VerificationCriterionResource
    {
        $verificationCriterion = $this->service->create($request->validated());

        return new VerificationCriterionResource(
            $verificationCriterion->load('updatedBy.user')
        );
    }

    public function show(VerificationCriterion $verificationCriterion): VerificationCriterionResource
    {
        return new VerificationCriterionResource(
            $verificationCriterion->load('updatedBy.user')
        );
    }

    public function update(
        UpdateVerificationCriterionRequest $request,
        VerificationCriterion $verificationCriterion
    ): VerificationCriterionResource {
        $verificationCriterion->update($request->validated());

        return new VerificationCriterionResource(
            $verificationCriterion->load('updatedBy.user')
        );
    }

    public function destroy(VerificationCriterion $verificationCriterion): Response
    {
        $verificationCriterion->delete();

        return response()->noContent();
    }
}
