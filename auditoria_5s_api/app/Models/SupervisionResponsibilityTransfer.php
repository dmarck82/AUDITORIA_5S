<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisionResponsibilityTransfer extends Model
{
    protected $fillable = [
        'from_user_id',
        'from_user_name_snapshot',
        'to_user_id',
        'to_user_name_snapshot',
        'assumed_by_operator_id',
        'assumed_by_name_snapshot',
        'justification',
    ];

    public function supervision(): BelongsTo
    {
        return $this->belongsTo(Supervision::class);
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function assumedBy(): BelongsTo
    {
        return $this->belongsTo(Operator::class, 'assumed_by_operator_id');
    }
}
