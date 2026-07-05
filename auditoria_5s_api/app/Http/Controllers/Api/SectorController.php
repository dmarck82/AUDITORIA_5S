<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sectors\StoreSectorRequest;
use App\Http\Requests\Sectors\UpdateSectorRequest;
use App\Http\Resources\SectorListResource;
use App\Http\Resources\SectorResource;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SectorController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return SectorListResource::collection(
            Sector::query()
                ->with(['unit:id,name,organization_id,active', 'updatedBy.person'])
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreSectorRequest $request): SectorResource
    {
        $sector = Sector::create($request->validated());

        return new SectorResource($sector->load('unit.organization', 'updatedBy.person'));
    }

    public function show(Sector $sector): SectorResource
    {
        return new SectorResource($sector->load('unit.organization', 'updatedBy.person'));
    }

    public function update(UpdateSectorRequest $request, Sector $sector): SectorResource
    {
        $sector->update($request->validated());

        return new SectorResource($sector->load('unit.organization', 'updatedBy.person'));
    }

    public function destroy(Sector $sector): Response|JsonResponse
    {
        if ($sector->people()->exists()) {
            return response()->json([
                'message' => 'This sector cannot be deleted because it has people linked to it.',
            ], 409);
        }

        $sector->delete();

        return response()->noContent();
    }
}
