<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Questions\StoreQuestionRequest;
use App\Http\Requests\Questions\UpdateQuestionRequest;
use App\Http\Resources\QuestionCategoryResource;
use App\Http\Resources\QuestionListResource;
use App\Http\Resources\QuestionResource;
use App\Models\GenericTable;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class QuestionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return QuestionListResource::collection(
            Question::query()
                ->with(['questionnaire:id,name,description,active', 'updatedBy.person'])
                ->when($request->filled('questionnaire_id'), fn ($query) => $query->where('questionnaire_id', $request->integer('questionnaire_id')))
                ->orderBy('questionnaire_id')
                ->orderBy('sort_order')
                ->paginate()
        );
    }

    public function store(StoreQuestionRequest $request): QuestionResource
    {
        $question = Question::create($request->validated());

        return new QuestionResource($question->load('questionnaire', 'updatedBy.person'));
    }

    public function show(Question $question): QuestionResource
    {
        return new QuestionResource($question->load('questionnaire', 'updatedBy.person'));
    }

    public function update(UpdateQuestionRequest $request, Question $question): QuestionResource
    {
        $question->update($request->validated());

        return new QuestionResource($question->load('questionnaire', 'updatedBy.person'));
    }

    public function destroy(Question $question): Response
    {
        $question->delete();

        return response()->noContent();
    }

    public function categories(): AnonymousResourceCollection
    {
        $categories = GenericTable::query()
            ->where('code', 'QUESTION_CATEGORY')
            ->where('active', true)
            ->firstOrFail()
            ->items()
            ->where('active', true)
            ->orderBy('sort_order')
            ->get();

        return QuestionCategoryResource::collection($categories);
    }
}
