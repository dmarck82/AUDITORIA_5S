<?php

namespace App\Models;

use App\Enums\FiveSSense;
use App\Enums\SupervisionStatus;
use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Supervision extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'work_environment_id',
        'local_1_id_snapshot',
        'local_2_id_snapshot',
        'local_3_id_snapshot',
        'responsible_user_id',
        'operator_id',
        'status',
        'started_at',
        'sent_at',
        'response_started_at',
        'answered_at',
        'finalized_at',
        'work_environment_name_snapshot',
        'local_1_name_snapshot',
        'local_2_name_snapshot',
        'local_3_name_snapshot',
        'responsible_user_name_snapshot',
        'operator_name_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'status' => SupervisionStatus::class,
            'started_at' => 'datetime',
            'sent_at' => 'datetime',
            'response_started_at' => 'datetime',
            'answered_at' => 'datetime',
            'finalized_at' => 'datetime',
            'updated_by' => 'integer',
        ];
    }

    public function workEnvironment(): BelongsTo
    {
        return $this->belongsTo(WorkEnvironment::class);
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(SupervisionAnswer::class);
    }

    public function responsibilityTransfers(): HasMany
    {
        return $this->hasMany(SupervisionResponsibilityTransfer::class);
    }

    /** @return array<string, mixed> */
    public function scoreSummary(): array
    {
        $answers = $this->relationLoaded('answers')
            ? $this->answers
            : $this->answers()->get();

        return $this->summarizeAnswers($answers);
    }

    /** @return array<int, array<string, mixed>> */
    public function scoresBySense(): array
    {
        $answers = $this->relationLoaded('answers')
            ? $this->answers
            : $this->answers()->get();

        return array_map(function (FiveSSense $sense) use ($answers): array {
            return [
                'sense' => $sense->value,
                'sense_label' => $sense->label(),
                ...$this->summarizeAnswers(
                    $answers->where('sense_snapshot', $sense)
                ),
            ];
        }, FiveSSense::cases());
    }

    /**
     * @param  Collection<int, SupervisionAnswer>  $answers
     * @return array<string, int|float|null>
     */
    private function summarizeAnswers(Collection $answers): array
    {
        $applicable = $answers->filter(
            fn (SupervisionAnswer $answer) => ! $answer->not_applicable
                && $answer->selected_value !== null
        );
        $answered = $answers->filter(
            fn (SupervisionAnswer $answer) => $answer->not_applicable
                || $answer->selected_value !== null
        );
        $maximumPoints = $applicable->count() * 15;
        $obtainedPoints = (int) $applicable->sum('selected_value');

        return [
            'total_criteria' => $answers->count(),
            'answered_criteria' => $answered->count(),
            'applicable_criteria' => $applicable->count(),
            'not_applicable_criteria' => $answers->where('not_applicable', true)->count(),
            'nonconformities' => $applicable->whereIn('selected_value', [0, 5])->count(),
            'obtained_points' => $obtainedPoints,
            'maximum_points' => $maximumPoints,
            'percentage' => $maximumPoints > 0
                ? round(($obtainedPoints / $maximumPoints) * 100, 2)
                : null,
        ];
    }
}
