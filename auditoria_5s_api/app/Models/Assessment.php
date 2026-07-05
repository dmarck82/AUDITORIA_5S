<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Assessment extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'questionnaire_id',
        'organization_id',
        'unit_id',
        'sector_id',
        'person_id',
        'title',
        'status',
        'expires_at',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'answered_at' => 'datetime',
            'active' => 'boolean',
            'created_by' => 'integer',
            'updated_by' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $assessment): void {
            $assessment->access_code ??= self::makeAccessCode();

            $userId = auth('api')->id() ?? auth()->id();

            if ($userId) {
                $assessment->created_by = $userId;
            }
        });
    }

    public static function makeAccessCode(): string
    {
        do {
            $accessCode = strtoupper(Str::random(12));
        } while (self::query()->where('access_code', $accessCode)->exists());

        return $accessCode;
    }

    public function questionnaire(): BelongsTo
    {
        return $this->belongsTo(Questionnaire::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
