<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Criterion extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'evaluation_dimension_id',
        'evaluation_model_id',
        'code',
        'text',
        'description',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'evaluation_dimension_id' => 'integer',
            'evaluation_model_id' => 'integer',
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function evaluationDimension(): BelongsTo
    {
        return $this->belongsTo(EvaluationDimension::class);
    }

    public function evaluationModel(): BelongsTo
    {
        return $this->belongsTo(EvaluationModel::class);
    }
}
