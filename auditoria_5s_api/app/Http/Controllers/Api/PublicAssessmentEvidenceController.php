<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StorePublicEvidenceRequest;
use App\Http\Resources\PublicAssessmentResource;
use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Evidence;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicAssessmentEvidenceController extends Controller
{
    public function store(StorePublicEvidenceRequest $request, string $accessCode, AssessmentAnswer $answer): PublicAssessmentResource|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if ($error = $this->validateAvailability($assessment)) {
            return $error;
        }

        if ((int) $answer->assessment_id !== (int) $assessment->id) {
            return $this->error('The selected answer does not belong to this assessment.', 422);
        }

        if ($answer->evidences()->exists()) {
            return $this->error('Only one evidence is allowed per answer.', 422);
        }

        DB::transaction(function () use ($assessment, $answer, $request): void {
            if ($assessment->status === 'AVAILABLE') {
                $assessment->update(['status' => 'IN_PROGRESS']);
            }

            foreach ($request->file('files', []) as $file) {
                $path = $file->store('evidences', 'local');

                $answer->evidences()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        });

        return new PublicAssessmentResource($this->loadPublicRelations($assessment->refresh()));
    }

    public function destroy(string $accessCode, AssessmentAnswer $answer, Evidence $evidence): PublicAssessmentResource|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if ($error = $this->validateAvailability($assessment)) {
            return $error;
        }

        if ((int) $answer->assessment_id !== (int) $assessment->id) {
            return $this->error('The selected answer does not belong to this assessment.', 422);
        }

        if ((int) $evidence->assessment_answer_id !== (int) $answer->id) {
            return $this->error('The selected evidence does not belong to this answer.', 422);
        }

        Storage::disk('local')->delete($evidence->file_path);
        $evidence->delete();

        return new PublicAssessmentResource($this->loadPublicRelations($assessment->refresh()));
    }

    public function showFile(string $accessCode, AssessmentAnswer $answer, Evidence $evidence): BinaryFileResponse|JsonResponse
    {
        $assessment = $this->findAssessment($accessCode);

        if (!$assessment) {
            return $this->error('Assessment not found.', 404);
        }

        if (!$assessment->active || in_array($assessment->status, ['DRAFT', 'CANCELLED'], true)) {
            return $this->error('This assessment is not available for evidences.', 409);
        }

        if ((int) $answer->assessment_id !== (int) $assessment->id) {
            return $this->error('The selected answer does not belong to this assessment.', 422);
        }

        if ((int) $evidence->assessment_answer_id !== (int) $answer->id) {
            return $this->error('The selected evidence does not belong to this answer.', 422);
        }

        if (!Storage::disk('local')->exists($evidence->file_path)) {
            return $this->error('Evidence file not found.', 404);
        }

        return response()->file(Storage::disk('local')->path($evidence->file_path), [
            'Content-Type' => $evidence->mime_type,
            'Content-Disposition' => 'inline; filename="'.$evidence->original_name.'"',
        ]);
    }

    private function findAssessment(string $accessCode): ?Assessment
    {
        return Assessment::query()
            ->where('access_code', strtoupper($accessCode))
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
            'answers.assessment',
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
