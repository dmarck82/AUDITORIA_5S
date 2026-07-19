<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationDimension extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'methodology_id',
        'code',
        'name',
        'objective',
        'sort_order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'methodology_id' => 'integer',
            'sort_order' => 'integer',
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function methodology(): BelongsTo
    {
        return $this->belongsTo(Methodology::class);
    }
}
