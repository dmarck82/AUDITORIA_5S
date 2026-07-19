<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Process extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'sector_id',
        'name',
        'description',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class)->orderBy('sort_order');
    }
}
