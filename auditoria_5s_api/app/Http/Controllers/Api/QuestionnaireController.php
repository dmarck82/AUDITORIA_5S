<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Questionnaires\StoreQuestionnaireRequest;
use App\Http\Requests\Questionnaires\UpdateQuestionnaireRequest;
use App\Http\Resources\QuestionnaireListResource;
use App\Http\Resources\QuestionnaireResource;
use App\Models\Questionnaire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuestionnaireController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return QuestionnaireListResource::collection(
            Questionnaire::query()
                ->withCount('questions')
                ->with('updatedBy.person')
                ->latest()
                ->paginate()
        );
    }

    public function store(StoreQuestionnaireRequest $request): QuestionnaireResource
    {
        $questionnaire = Questionnaire::create($request->validated());

        return new QuestionnaireResource($questionnaire->loadCount('questions')->load('updatedBy.person'));
    }

    public function show(Questionnaire $questionnaire): QuestionnaireResource
    {
        return new QuestionnaireResource($questionnaire->loadCount('questions')->load('updatedBy.person'));
    }

    public function update(UpdateQuestionnaireRequest $request, Questionnaire $questionnaire): QuestionnaireResource
    {
        $questionnaire->update($request->validated());

        return new QuestionnaireResource($questionnaire->loadCount('questions')->load('updatedBy.person'));
    }

    public function destroy(Questionnaire $questionnaire): Response|JsonResponse
    {
        if ($questionnaire->questions()->exists()) {
            return response()->json([
                'message' => 'This questionnaire cannot be deleted because it has questions.',
            ], 409);
        }

        $questionnaire->delete();

        return response()->noContent();
    }
}
