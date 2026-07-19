<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'process_id',
        'name',
        'description',
        'sort_order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function process(): BelongsTo
    {
        return $this->belongsTo(Process::class);
    }
}
