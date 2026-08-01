<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Local3 extends Model
{
    protected $table = 'local_3s';

    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'local_2_id',
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

    public function local2(): BelongsTo
    {
        return $this->belongsTo(Local2::class, 'local_2_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'local_3_id');
    }

    public function workEnvironments(): HasMany
    {
        return $this->hasMany(WorkEnvironment::class, 'local_3_id');
    }
}
