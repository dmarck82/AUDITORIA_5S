<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Criteria\StoreCriterionRequest;
use App\Http\Requests\Criteria\UpdateCriterionRequest;
use App\Http\Resources\CriterionListResource;
use App\Http\Resources\CriterionResource;
use App\Models\Criterion;
use App\Support\CodeGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CriterionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return CriterionListResource::collection(
            Criterion::query()
                ->with(['evaluationDimension.methodology', 'evaluationModel', 'updatedBy.person'])
                ->when($request->filled('methodology_id'), fn ($query) => $query->whereHas('evaluationDimension', fn ($dimensionQuery) => $dimensionQuery->where('methodology_id', $request->integer('methodology_id'))))
                ->when($request->filled('evaluation_dimension_id'), fn ($query) => $query->where('evaluation_dimension_id', $request->integer('evaluation_dimension_id')))
                ->when($request->filled('evaluation_model_id'), fn ($query) => $query->where('evaluation_model_id', $request->integer('evaluation_model_id')))
                ->when($request->has('active') && $request->input('active') !== '', fn ($query) => $query->where('active', $request->boolean('active')))
                ->orderBy('code')
                ->paginate()
        );
    }

    public function store(StoreCriterionRequest $request): CriterionResource
    {
        $data = $request->validated();
        $data['code'] = ($data['code'] ?? null) ?: CodeGenerator::next('criteria', 'CRI');

        $criterion = Criterion::create($data);

        return new CriterionResource($criterion->load($this->relations()));
    }

    public function show(Criterion $criterion): CriterionResource
    {
        return new CriterionResource($criterion->load($this->relations()));
    }

    public function update(UpdateCriterionRequest $request, Criterion $criterion): CriterionResource
    {
        $criterion->update($request->validated());

        return new CriterionResource($criterion->load($this->relations()));
    }

    public function destroy(Criterion $criterion): Response
    {
        $criterion->delete();

        return response()->noContent();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function relations(): array
    {
        return [
            'evaluationDimension.methodology',
            'evaluationModel',
            'updatedBy.person',
        ];
    }
}
