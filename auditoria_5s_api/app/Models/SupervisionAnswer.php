<?php

namespace App\Models;

use App\Enums\FiveSSense;
use App\Enums\ResponseScore;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'supervision_id',
        'verification_criterion_id',
        'criterion_code_snapshot',
        'sense_snapshot',
        'criterion_question_snapshot',
        'response_0_label_snapshot',
        'response_5_label_snapshot',
        'response_10_label_snapshot',
        'response_15_label_snapshot',
        'selected_value',
        'not_applicable',
        'observation',
        'evidence',
    ];

    protected function casts(): array
    {
        return [
            'sense_snapshot' => FiveSSense::class,
            'selected_value' => 'integer',
            'not_applicable' => 'boolean',
        ];
    }

    public function supervision(): BelongsTo
    {
        return $this->belongsTo(Supervision::class);
    }

    public function verificationCriterion(): BelongsTo
    {
        return $this->belongsTo(VerificationCriterion::class);
    }

    public function isNonconformity(): bool
    {
        return ! $this->not_applicable
            && in_array($this->selected_value, [0, 5], true);
    }

    /** @return array<int, array{value: int, label: string}> */
    public function responseOptions(): array
    {
        return array_map(fn (ResponseScore $score): array => [
            'value' => $score->value,
            'label' => $this->{$score->fieldName().'_snapshot'},
        ], ResponseScore::cases());
    }
}
