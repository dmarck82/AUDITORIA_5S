<?php

namespace App\Models\Concerns;

use App\Models\Operator;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait TracksUpdatedBy
{
    protected static function bootTracksUpdatedBy(): void
    {
        static::saving(function ($model): void {
            $operatorId = auth('api')->id() ?? auth()->id();

            if ($operatorId) {
                $model->updated_by = $operatorId;
            }
        });
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(Operator::class, 'updated_by');
    }
}
