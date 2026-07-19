<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationModelOption extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'evaluation_model_id',
        'value',
        'description',
        'sort_order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'evaluation_model_id' => 'integer',
            'sort_order' => 'integer',
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function evaluationModel(): BelongsTo
    {
        return $this->belongsTo(EvaluationModel::class);
    }
}
