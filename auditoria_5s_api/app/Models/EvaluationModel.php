<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationModel extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'code',
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
}
