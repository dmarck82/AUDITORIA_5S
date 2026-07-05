<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Units\StoreUnitRequest;
use App\Http\Requests\Units\UpdateUnitRequest;
use App\Http\Resources\UnitListResource;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class UnitController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UnitListResource::collection(
            Unit::query()
                ->with(['organization:id,name,active', 'updatedBy.person'])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreUnitRequest $request): UnitResource
    {
        $unit = Unit::create($request->validated());

        return new UnitResource($unit->load(['organization:id,name,active', 'updatedBy.person']));
    }

    public function show(Unit $unit): UnitResource
    {
        return new UnitResource($unit->load(['organization:id,name,active', 'updatedBy.person']));
    }

    public function update(UpdateUnitRequest $request, Unit $unit): UnitResource
    {
        $unit->update($request->validated());

        return new UnitResource($unit->load(['organization:id,name,active', 'updatedBy.person']));
    }

    public function destroy(Unit $unit): Response|JsonResponse
    {
        if ($unit->sectors()->exists()) {
            return response()->json([
                'message' => 'This unit cannot be deleted because it has sectors.',
            ], 409);
        }

        if ($unit->people()->exists()) {
            return response()->json([
                'message' => 'This unit cannot be deleted because it has people linked to it.',
            ], 409);
        }

        $unit->delete();

        return response()->noContent();
    }
}
