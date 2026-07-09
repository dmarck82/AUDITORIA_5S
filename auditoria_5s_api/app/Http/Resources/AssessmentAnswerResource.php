<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentAnswerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'score' => $this->score,
            'observation' => $this->observation,
            'question' => new QuestionListResource($this->whenLoaded('question')),
            'evidences' => $this->whenLoaded('evidences', fn () => $this->evidences->map(fn ($evidence): array => [
                'id' => $evidence->id,
                'url' => $this->assessment?->access_code ? route('public.assessment.evidences.show', [
                    'accessCode' => $this->assessment->access_code,
                    'answer' => $this->id,
                    'evidence' => $evidence->id,
                ]) : null,
                'original_name' => $evidence->original_name,
                'mime_type' => $evidence->mime_type,
                'file_size' => $evidence->file_size,
            ])->values()),
        ];
    }
}
