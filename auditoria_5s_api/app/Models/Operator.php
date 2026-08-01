<?php

namespace App\Models;

use App\Models\Concerns\TracksUpdatedBy;
use App\Support\AccessPermissions;
use Database\Factories\OperatorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Operator extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<OperatorFactory> */
    use HasFactory, Notifiable, TracksUpdatedBy;

    protected $fillable = [
        'user_id',
        'password',
        'access_level',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'name',
        'email',
        'phone',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'access_level' => 'integer',
            'updated_by' => 'integer',
            'password' => 'hashed',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supervisions(): HasMany
    {
        return $this->hasMany(Supervision::class);
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public static function findForLogin(string $login): ?self
    {
        return self::query()
            ->where('active', true)
            ->whereHas('user', function ($query) use ($login) {
                $query
                    ->where('active', true)
                    ->where(function ($query) use ($login) {
                        $query
                            ->where('email', $login)
                            ->orWhere('phone', $login);
                    });
            })
            ->first();
    }

    public function getNameAttribute(): ?string
    {
        return $this->user?->name;
    }

    public function getEmailAttribute(): ?string
    {
        return $this->user?->email;
    }

    public function getPhoneAttribute(): ?string
    {
        return $this->user?->phone;
    }

    public function routeNotificationForMail(): ?string
    {
        return $this->email;
    }

    /**
     * @return array<string>
     */
    public function permissions(): array
    {
        return AccessPermissions::forOperator($this);
    }

    public function hasPermission(string $permission): bool
    {
        return AccessPermissions::can($this, $permission);
    }
}
