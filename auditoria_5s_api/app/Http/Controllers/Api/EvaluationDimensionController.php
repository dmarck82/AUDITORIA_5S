<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationDimensions\ReorderEvaluationDimensionsRequest;
use App\Http\Requests\EvaluationDimensions\StoreEvaluationDimensionRequest;
use App\Http\Requests\EvaluationDimensions\UpdateEvaluationDimensionRequest;
use App\Http\Resources\EvaluationDimensionListResource;
use App\Http\Resources\EvaluationDimensionResource;
use App\Models\EvaluationDimension;
use App\Support\CodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EvaluationDimensionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return EvaluationDimensionListResource::collection(
            EvaluationDimension::query()
                ->with(['methodology', 'updatedBy.person'])
                ->when($request->filled('methodology_id'), fn ($query) => $query->where('methodology_id', $request->integer('methodology_id')))
                ->orderBy('methodology_id')
                ->orderBy('sort_order')
                ->paginate()
        );
    }

    public function store(StoreEvaluationDimensionRequest $request): EvaluationDimensionResource
    {
        $data = $request->validated();
        $data['code'] = ($data['code'] ?? null) ?: CodeGenerator::next(
            'evaluation_dimensions',
            'DIM',
            fn ($query) => $query->where('methodology_id', $data['methodology_id'])
        );

        $dimension = EvaluationDimension::create($data);

        return new EvaluationDimensionResource($dimension->load($this->relations()));
    }

    public function show(EvaluationDimension $evaluationDimension): EvaluationDimensionResource
    {
        return new EvaluationDimensionResource($evaluationDimension->load($this->relations()));
    }

    public function update(UpdateEvaluationDimensionRequest $request, EvaluationDimension $evaluationDimension): EvaluationDimensionResource
    {
        $evaluationDimension->update($request->validated());

        return new EvaluationDimensionResource($evaluationDimension->load($this->relations()));
    }

    public function reorder(ReorderEvaluationDimensionsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $methodologyId = (int) $validated['methodology_id'];
        $dimensionIds = array_map('intval', $validated['dimensions']);

        $totalDimensions = EvaluationDimension::query()
            ->where('methodology_id', $methodologyId)
            ->count();

        if ($totalDimensions !== count($dimensionIds)) {
            return response()->json([
                'message' => 'All methodology dimensions must be sent to reorder.',
            ], 422);
        }

        $validDimensionIds = EvaluationDimension::query()
            ->where('methodology_id', $methodologyId)
            ->whereIn('id', $dimensionIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        sort($validDimensionIds);
        $sortedDimensionIds = $dimensionIds;
        sort($sortedDimensionIds);

        if ($validDimensionIds !== $sortedDimensionIds) {
            return response()->json([
                'message' => 'All dimensions must belong to the selected methodology.',
            ], 422);
        }

        DB::transaction(function () use ($dimensionIds): void {
            foreach ($dimensionIds as $index => $dimensionId) {
                EvaluationDimension::query()
                    ->whereKey($dimensionId)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json([
            'message' => 'Dimensions reordered successfully.',
        ]);
    }

    public function destroy(EvaluationDimension $evaluationDimension): Response|JsonResponse
    {
        if ($evaluationDimension->criteria()->exists()) {
            return response()->json([
                'message' => 'This evaluation dimension cannot be deleted because it has criteria linked to it.',
            ], 409);
        }

        $evaluationDimension->delete();

        return response()->noContent();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function relations(): array
    {
        return [
            'methodology',
            'updatedBy.person',
        ];
    }
}
