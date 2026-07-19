<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Methodologies\StoreMethodologyRequest;
use App\Http\Requests\Methodologies\UpdateMethodologyRequest;
use App\Http\Resources\MethodologyListResource;
use App\Http\Resources\MethodologyResource;
use App\Models\Methodology;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class MethodologyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return MethodologyListResource::collection(
            Methodology::query()
                ->with('updatedBy.person')
                ->withCount('evaluationDimensions')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreMethodologyRequest $request): MethodologyResource
    {
        $methodology = Methodology::create($request->validated());

        return new MethodologyResource($methodology->load('updatedBy.person')->loadCount('evaluationDimensions'));
    }

    public function show(Methodology $methodology): MethodologyResource
    {
        return new MethodologyResource($methodology->load(['updatedBy.person', 'evaluationDimensions' => fn ($query) => $query->with('updatedBy.person')->orderBy('sort_order')])->loadCount('evaluationDimensions'));
    }

    public function update(UpdateMethodologyRequest $request, Methodology $methodology): MethodologyResource
    {
        $methodology->update($request->validated());

        return new MethodologyResource($methodology->load('updatedBy.person')->loadCount('evaluationDimensions'));
    }

    public function destroy(Methodology $methodology): Response|JsonResponse
    {
        if ($methodology->evaluationDimensions()->exists()) {
            return response()->json([
                'message' => 'This methodology cannot be deleted because it has evaluation dimensions linked to it.',
            ], 409);
        }

        $methodology->delete();

        return response()->noContent();
    }
}
