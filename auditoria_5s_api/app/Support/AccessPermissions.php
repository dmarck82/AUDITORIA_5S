<?php

namespace App\Support;

use App\Enums\AccessLevel;
use App\Models\Operator;

class AccessPermissions
{
    /** @var array<string> */
    private const PERMISSIONS = [
        'local1s.view', 'local1s.create', 'local1s.update', 'local1s.delete',
        'local2s.view', 'local2s.create', 'local2s.update', 'local2s.delete',
        'local3s.view', 'local3s.create', 'local3s.update', 'local3s.delete',
        'work_environments.view', 'work_environments.create', 'work_environments.update', 'work_environments.delete',
        'verification_criteria.view', 'verification_criteria.create', 'verification_criteria.update', 'verification_criteria.delete',
        'supervisions.view', 'supervisions.create', 'supervisions.update', 'supervisions.send',
        'supervisions.answer', 'supervisions.submit', 'supervisions.finalize', 'supervisions.assume', 'supervisions.delete',
        'users.view', 'users.create', 'users.update', 'users.delete',
        'operators.view', 'operators.create', 'operators.update', 'operators.delete',
    ];

    /** @var array<int, array<string>> */
    private const MATRIX = [
        AccessLevel::Viewer->value => [
            'local1s.view', 'local2s.view', 'local3s.view', 'work_environments.view', 'verification_criteria.view', 'users.view',
        ],
        AccessLevel::Respondent->value => [
            'local1s.view', 'local2s.view', 'local3s.view', 'work_environments.view', 'verification_criteria.view',
            'supervisions.view', 'supervisions.answer', 'supervisions.submit',
        ],
        AccessLevel::Operator->value => [
            'local1s.view', 'local2s.view', 'local3s.view', 'work_environments.view', 'verification_criteria.view', 'users.view',
            'supervisions.view', 'supervisions.answer', 'supervisions.submit', 'supervisions.assume',
        ],
        AccessLevel::Manager->value => [
            'local1s.view',
            'local2s.view', 'local2s.create', 'local2s.update',
            'local3s.view', 'local3s.create', 'local3s.update',
            'work_environments.view', 'work_environments.create', 'work_environments.update',
            'verification_criteria.view', 'verification_criteria.create', 'verification_criteria.update',
            'supervisions.view', 'supervisions.create', 'supervisions.update', 'supervisions.send',
            'supervisions.answer', 'supervisions.submit', 'supervisions.finalize', 'supervisions.assume', 'supervisions.delete',
            'users.view', 'users.create', 'users.update',
            'operators.view',
        ],
        AccessLevel::Administrator->value => self::PERMISSIONS,
    ];

    public static function can(Operator $operator, string $permission): bool
    {
        return in_array($permission, self::forAccessLevel((int) $operator->access_level), true);
    }

    /** @return array<string> */
    public static function forOperator(Operator $operator): array
    {
        return self::forAccessLevel((int) $operator->access_level);
    }

    /** @return array<string> */
    public static function forAccessLevel(int $accessLevel): array
    {
        return self::MATRIX[$accessLevel] ?? [];
    }

    public static function exists(string $permission): bool
    {
        return in_array($permission, self::PERMISSIONS, true);
    }
}
