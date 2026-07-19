<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationModelOptions\ReorderEvaluationModelOptionsRequest;
use App\Http\Requests\EvaluationModelOptions\StoreEvaluationModelOptionRequest;
use App\Http\Requests\EvaluationModelOptions\UpdateEvaluationModelOptionRequest;
use App\Http\Resources\EvaluationModelOptionListResource;
use App\Http\Resources\EvaluationModelOptionResource;
use App\Models\EvaluationModelOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EvaluationModelOptionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return EvaluationModelOptionListResource::collection(
            EvaluationModelOption::query()
                ->with(['evaluationModel', 'updatedBy.person'])
                ->when($request->filled('evaluation_model_id'), fn ($query) => $query->where('evaluation_model_id', $request->integer('evaluation_model_id')))
                ->orderBy('evaluation_model_id')
                ->orderBy('sort_order')
                ->paginate()
        );
    }

    public function store(StoreEvaluationModelOptionRequest $request): EvaluationModelOptionResource
    {
        $option = EvaluationModelOption::create($request->validated());

        return new EvaluationModelOptionResource($option->load($this->relations()));
    }

    public function show(EvaluationModelOption $evaluationModelOption): EvaluationModelOptionResource
    {
        return new EvaluationModelOptionResource($evaluationModelOption->load($this->relations()));
    }

    public function update(UpdateEvaluationModelOptionRequest $request, EvaluationModelOption $evaluationModelOption): EvaluationModelOptionResource
    {
        $evaluationModelOption->update($request->validated());

        return new EvaluationModelOptionResource($evaluationModelOption->load($this->relations()));
    }

    public function reorder(ReorderEvaluationModelOptionsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $modelId = (int) $validated['evaluation_model_id'];
        $optionIds = array_map('intval', $validated['options']);

        $totalOptions = EvaluationModelOption::query()
            ->where('evaluation_model_id', $modelId)
            ->count();

        if ($totalOptions !== count($optionIds)) {
            return response()->json([
                'message' => 'All evaluation model options must be sent to reorder.',
            ], 422);
        }

        $validOptionIds = EvaluationModelOption::query()
            ->where('evaluation_model_id', $modelId)
            ->whereIn('id', $optionIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        sort($validOptionIds);
        $sortedOptionIds = $optionIds;
        sort($sortedOptionIds);

        if ($validOptionIds !== $sortedOptionIds) {
            return response()->json([
                'message' => 'All options must belong to the selected evaluation model.',
            ], 422);
        }

        DB::transaction(function () use ($optionIds): void {
            foreach ($optionIds as $index => $optionId) {
                EvaluationModelOption::query()
                    ->whereKey($optionId)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json([
            'message' => 'Options reordered successfully.',
        ]);
    }

    public function destroy(EvaluationModelOption $evaluationModelOption): Response
    {
        $evaluationModelOption->delete();

        return response()->noContent();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function relations(): array
    {
        return [
            'evaluationModel',
            'updatedBy.person',
        ];
    }
}
