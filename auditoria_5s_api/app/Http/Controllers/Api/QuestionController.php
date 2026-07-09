<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Questions\ReorderQuestionsRequest;
use App\Http\Requests\Questions\StoreQuestionRequest;
use App\Http\Requests\Questions\UpdateQuestionRequest;
use App\Http\Resources\QuestionCategoryResource;
use App\Http\Resources\QuestionListResource;
use App\Http\Resources\QuestionResource;
use App\Models\GenericTable;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

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

    public function reorder(ReorderQuestionsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $questionnaireId = (int) $validated['questionnaire_id'];
        $questionIds = array_map('intval', $validated['questions']);

        $totalQuestions = Question::query()
            ->where('questionnaire_id', $questionnaireId)
            ->count();

        if ($totalQuestions !== count($questionIds)) {
            return response()->json([
                'message' => 'All questionnaire questions must be sent to reorder.',
            ], 422);
        }

        $validQuestionIds = Question::query()
            ->where('questionnaire_id', $questionnaireId)
            ->whereIn('id', $questionIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        sort($validQuestionIds);
        $sortedQuestionIds = $questionIds;
        sort($sortedQuestionIds);

        if ($validQuestionIds !== $sortedQuestionIds) {
            return response()->json([
                'message' => 'All questions must belong to the selected questionnaire.',
            ], 422);
        }

        DB::transaction(function () use ($questionIds): void {
            foreach ($questionIds as $index => $questionId) {
                Question::query()
                    ->whereKey($questionId)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json([
            'message' => 'Questions reordered successfully.',
        ]);
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
