<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicEvidenceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $accessCode = $request->route('accessCode')
            ?: $this->assessmentAnswer?->assessment?->access_code;

        return [
            'id' => $this->id,
            'url' => $accessCode ? route('public.assessment.evidences.show', [
                'accessCode' => $accessCode,
                'answer' => $this->assessment_answer_id,
                'evidence' => $this->id,
            ]) : null,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
        ];
    }
}
