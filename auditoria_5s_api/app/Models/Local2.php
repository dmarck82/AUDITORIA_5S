<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Local2 extends Model
{
    protected $table = 'local_2s';

    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'local_1_id',
        'name',
        'address',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function local1(): BelongsTo
    {
        return $this->belongsTo(Local1::class, 'local_1_id');
    }

    public function local3s(): HasMany
    {
        return $this->hasMany(Local3::class, 'local_2_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'local_2_id');
    }
}
