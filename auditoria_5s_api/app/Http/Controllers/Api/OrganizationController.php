<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organizations\StoreOrganizationRequest;
use App\Http\Requests\Organizations\UpdateOrganizationRequest;
use App\Http\Resources\OrganizationListResource;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class OrganizationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return OrganizationListResource::collection(
            Organization::query()
                ->with('updatedBy.person')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreOrganizationRequest $request): OrganizationResource
    {
        $organization = Organization::create($request->validated());

        return new OrganizationResource($organization->load('updatedBy.person'));
    }

    public function show(Organization $organization): OrganizationResource
    {
        return new OrganizationResource($organization->load('updatedBy.person'));
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization): OrganizationResource
    {
        $organization->update($request->validated());

        return new OrganizationResource($organization->load('updatedBy.person'));
    }

    public function destroy(Organization $organization): Response|JsonResponse
    {
        if ($organization->units()->exists()) {
            return response()->json([
                'message' => 'This organization cannot be deleted because it has units.',
            ], 409);
        }

        if ($organization->people()->exists()) {
            return response()->json([
                'message' => 'This organization cannot be deleted because it has people linked to it.',
            ], 409);
        }

        $organization->delete();

        return response()->noContent();
    }
}
