<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'question_id',
        'person_id',
        'score',
        'observation',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
        ];
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function evidences(): HasMany
    {
        return $this->hasMany(Evidence::class);
    }
}
