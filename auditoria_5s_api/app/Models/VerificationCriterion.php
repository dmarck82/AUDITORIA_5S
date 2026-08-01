<?php

namespace App\Models;

use App\Enums\FiveSSense;
use App\Enums\ResponseScore;
use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VerificationCriterion extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $attributes = [
        'response_0_label' => 'Não atende ao requisito',
        'response_5_label' => 'Atende parcialmente, com falhas relevantes',
        'response_10_label' => 'Atende, com pequenas oportunidades de melhoria',
        'response_15_label' => 'Atende plenamente ao padrão estabelecido',
    ];

    protected $fillable = [
        'code',
        'sense',
        'question',
        'response_0_label',
        'response_5_label',
        'response_10_label',
        'response_15_label',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'sense' => FiveSSense::class,
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function supervisionAnswers(): HasMany
    {
        return $this->hasMany(SupervisionAnswer::class);
    }

    public function workEnvironments(): BelongsToMany
    {
        return $this->belongsToMany(
            WorkEnvironment::class,
            'work_environment_criteria'
        )->withTimestamps();
    }

    /** @return array<int, array{value: int, label: string}> */
    public function responseOptions(): array
    {
        return array_map(fn (ResponseScore $score): array => [
            'value' => $score->value,
            'label' => $this->{$score->fieldName()},
        ], ResponseScore::cases());
    }
}
