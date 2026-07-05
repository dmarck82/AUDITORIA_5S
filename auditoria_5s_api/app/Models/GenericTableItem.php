<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GenericTableItem extends Model
{
    use HasFactory, TracksUpdatedBy;

    protected $fillable = [
        'generic_table_id',
        'code',
        'name',
        'description',
        'sort_order',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'updated_by' => 'integer',
        ];
    }

    public function genericTable(): BelongsTo
    {
        return $this->belongsTo(GenericTable::class);
    }
}
