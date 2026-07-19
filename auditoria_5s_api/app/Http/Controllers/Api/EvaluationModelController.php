<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationModels\StoreEvaluationModelRequest;
use App\Http\Requests\EvaluationModels\UpdateEvaluationModelRequest;
use App\Http\Resources\EvaluationModelListResource;
use App\Http\Resources\EvaluationModelResource;
use App\Models\EvaluationModel;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class EvaluationModelController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return EvaluationModelListResource::collection(
            EvaluationModel::query()
                ->with('updatedBy.person')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreEvaluationModelRequest $request): EvaluationModelResource
    {
        $model = EvaluationModel::create($request->validated());

        return new EvaluationModelResource($model->load('updatedBy.person'));
    }

    public function show(EvaluationModel $evaluationModel): EvaluationModelResource
    {
        return new EvaluationModelResource($evaluationModel->load('updatedBy.person'));
    }

    public function update(UpdateEvaluationModelRequest $request, EvaluationModel $evaluationModel): EvaluationModelResource
    {
        $evaluationModel->update($request->validated());

        return new EvaluationModelResource($evaluationModel->load('updatedBy.person'));
    }

    public function destroy(EvaluationModel $evaluationModel): Response
    {
        $evaluationModel->delete();

        return response()->noContent();
    }
}
