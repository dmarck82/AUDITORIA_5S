<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\SaveAssessmentAnswersRequest;
use App\Http\Resources\PublicAssessmentResource;
use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicAssessmentController extends Controller
{
    public function showByAccessCode(string $accessCode): PublicAssessmentResource|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if ($error = $this->validateAvailability($assessment)) {
            return $error;
        }

        return new PublicAssessmentResource($this->loadPublicRelations($assessment));
    }

    public function saveAnswers(SaveAssessmentAnswersRequest $request, string $accessCode): PublicAssessmentResource|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if ($error = $this->validateAvailability($assessment)) {
            return $error;
        }

        $questionIds = $assessment->questionnaire
            ->questions()
            ->where('active', true)
            ->pluck('id')
            ->all();

        foreach ($request->validated('answers') as $answer) {
            if (!in_array((int) $answer['question_id'], $questionIds, true)) {
                return $this->error('One or more questions do not belong to this assessment questionnaire.', 422);
            }
        }

        DB::transaction(function () use ($assessment, $request): void {
            if ($assessment->status === 'AVAILABLE') {
                $assessment->update(['status' => 'IN_PROGRESS']);
            }

            foreach ($request->validated('answers') as $answer) {
                AssessmentAnswer::query()->updateOrCreate(
                    [
                        'assessment_id' => $assessment->id,
                        'question_id' => $answer['question_id'],
                    ],
                    [
                        'person_id' => $assessment->person_id,
                        'score' => $answer['score'],
                        'observation' => $answer['observation'] ?? null,
                    ]
                );
            }
        });

        return new PublicAssessmentResource($this->loadPublicRelations($assessment->refresh()));
    }

    public function complete(string $accessCode): PublicAssessmentResource|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if ($error = $this->validateAvailability($assessment)) {
            return $error;
        }

        $questionIds = $assessment->questionnaire
            ->questions()
            ->where('active', true)
            ->pluck('id')
            ->all();

        $answeredQuestionIds = $assessment->answers()
            ->whereIn('question_id', $questionIds)
            ->pluck('question_id')
            ->all();

        if (count(array_diff($questionIds, $answeredQuestionIds)) > 0) {
            return $this->error('All active questions must be answered before completing the assessment.', 422);
        }

        $assessment->forceFill([
            'status' => 'COMPLETED',
            'answered_at' => now(),
        ])->save();

        return new PublicAssessmentResource($this->loadPublicRelations($assessment->refresh()));
    }

    private function findAssessment(string $accessCode): ?Assessment
    {
        return Assessment::query()
            ->where('access_code', strtoupper($accessCode))
            ->with([
                'questionnaire.questions' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
                'organization:id,name',
                'unit:id,name',
                'sector:id,name',
                'person:id,name',
                'answers.evidences',
            ])
            ->first();
    }

    private function loadPublicRelations(Assessment $assessment): Assessment
    {
        return $assessment->load([
            'questionnaire.questions' => fn ($query) => $query->where('active', true)->orderBy('sort_order'),
            'organization:id,name',
            'unit:id,name',
            'sector:id,name',
            'person:id,name',
            'answers.evidences',
        ]);
    }

    private function validateAvailability(Assessment $assessment): ?JsonResponse
    {
        if ($assessment->status === 'DRAFT') {
            return $this->error('This assessment is still in draft status.', 409);
        }

        if ($assessment->status === 'CANCELLED') {
            return $this->error('This assessment has been cancelled.', 409);
        }

        if ($assessment->status === 'COMPLETED') {
            return $this->error('This assessment has already been completed.', 409);
        }

        if (!$assessment->active) {
            return $this->error('This assessment is inactive.', 409);
        }

        if (!in_array($assessment->status, ['AVAILABLE', 'IN_PROGRESS'], true)) {
            return $this->error('This assessment is not available for answers.', 409);
        }

        if ($assessment->expires_at && $assessment->expires_at->isPast()) {
            return $this->error('This assessment has expired.', 409);
        }

        return null;
    }

    private function error(string $message, int $status): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $status);
    }
}
