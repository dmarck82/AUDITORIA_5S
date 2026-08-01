<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkEnvironment extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'local_3_id',
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

    public function local3(): BelongsTo
    {
        return $this->belongsTo(Local3::class, 'local_3_id');
    }

    public function supervisions(): HasMany
    {
        return $this->hasMany(Supervision::class);
    }

    public function verificationCriteria(): BelongsToMany
    {
        return $this->belongsToMany(
            VerificationCriterion::class,
            'work_environment_criteria'
        )->withTimestamps();
    }
}
