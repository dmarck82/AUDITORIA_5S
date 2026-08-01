<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Local1 extends Model
{
    protected $table = 'local_1s';

    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'name',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function local2s(): HasMany
    {
        return $this->hasMany(Local2::class, 'local_1_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'local_1_id');
    }
}
