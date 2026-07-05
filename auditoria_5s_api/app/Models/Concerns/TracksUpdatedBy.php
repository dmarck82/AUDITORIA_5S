<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait TracksUpdatedBy
{
    protected static function bootTracksUpdatedBy(): void
    {
        static::saving(function ($model): void {
            $userId = auth('api')->id() ?? auth()->id();

            if ($userId) {
                $model->updated_by = $userId;
            }
        });
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
