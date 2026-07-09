<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicAssessmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $answers = $this->relationLoaded('answers') ? $this->answers->keyBy('question_id') : collect();
        $questions = $this->questionnaire?->questions ?? collect();

        return [
            'assessment' => [
                'id' => $this->id,
                'title' => $this->title,
                'status' => $this->status,
                'expires_at' => $this->expires_at,
                'organization' => $this->organization?->name,
                'unit' => $this->unit?->name,
                'sector' => $this->sector?->name,
                'person' => $this->person?->name,
            ],
            'questionnaire' => [
                'id' => $this->questionnaire?->id,
                'name' => $this->questionnaire?->name,
            ],
            'questions' => $questions
                ->map(function ($question) use ($answers): array {
                    $answer = $answers[$question->id] ?? null;

                    return [
                        'id' => $question->id,
                        'category' => $question->category,
                        'question' => $question->question,
                        'description' => $question->description,
                        'sort_order' => $question->sort_order,
                        'answer' => $answer ? [
                            'id' => $answer->id,
                            'score' => $answer->score,
                            'observation' => $answer->observation,
                            'evidences' => PublicEvidenceResource::collection(
                                $answer->relationLoaded('evidences') ? $answer->evidences : collect()
                            ),
                        ] : null,
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
