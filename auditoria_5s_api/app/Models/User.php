<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'photo_path',
        'local_1_id',
        'local_2_id',
        'local_3_id',
        'job_title',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function operator(): HasOne
    {
        return $this->hasOne(Operator::class);
    }

    public function local1(): BelongsTo
    {
        return $this->belongsTo(Local1::class, 'local_1_id');
    }

    public function local2(): BelongsTo
    {
        return $this->belongsTo(Local2::class, 'local_2_id');
    }

    public function local3(): BelongsTo
    {
        return $this->belongsTo(Local3::class, 'local_3_id');
    }

    public function responsibleSupervisions(): HasMany
    {
        return $this->hasMany(Supervision::class, 'responsible_user_id');
    }
}
