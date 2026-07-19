<?php

namespace App\Support;

use App\Enums\AccessLevel;
use App\Models\User;

class AccessPermissions
{
    /**
     * @var array<string>
     */
    private const PERMISSIONS = [
        'organizations.view',
        'organizations.create',
        'organizations.update',
        'organizations.delete',
        'units.view',
        'units.create',
        'units.update',
        'units.delete',
        'sectors.view',
        'sectors.create',
        'sectors.update',
        'sectors.delete',
        'processes.view',
        'processes.create',
        'processes.update',
        'processes.delete',
        'activities.view',
        'activities.create',
        'activities.update',
        'activities.delete',
        'methodologies.view',
        'methodologies.create',
        'methodologies.update',
        'methodologies.delete',
        'people.view',
        'people.create',
        'people.update',
        'people.delete',
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'questionnaires.view',
        'questionnaires.create',
        'questionnaires.update',
        'questionnaires.delete',
        'questions.view',
        'questions.create',
        'questions.update',
        'questions.delete',
        'assessments.view',
        'assessments.create',
        'assessments.update',
        'assessments.delete',
        'assessments.view_own',
        'assessments.answer_own',
        'assessment_answers.view',
        'assessment_answers.create',
        'assessment_answers.update',
        'assessment_answers.delete',
        'assessment_answers.view_own',
        'assessment_answers.create_own',
        'evidences.view',
        'evidences.create',
        'evidences.delete',
        'evidences.view_own',
        'evidences.create_own',
        'dashboards.view',
        'reports.view',
    ];

    /**
     * @var array<int, array<string>>
     */
    private const MATRIX = [
        AccessLevel::Viewer->value => [
            'organizations.view',
            'units.view',
            'sectors.view',
            'processes.view',
            'activities.view',
            'people.view',
            'questionnaires.view',
            'methodologies.view',
            'questions.view',
            'assessments.view',
        ],
        AccessLevel::Respondent->value => [
            'organizations.view',
            'units.view',
            'sectors.view',
            'assessments.view_own',
            'assessments.answer_own',
            'assessment_answers.view_own',
            'assessment_answers.create_own',
            'evidences.view_own',
            'evidences.create_own',
        ],
        AccessLevel::Operator->value => [
            'organizations.view',
            'units.view',
            'sectors.view',
            'processes.view',
            'activities.view',
            'people.view',
            'questionnaires.view',
            'methodologies.view',
            'questions.view',
            'assessments.view',
            'assessments.create',
            'assessments.update',
        ],
        AccessLevel::Manager->value => [
            'organizations.view',
            'units.view',
            'units.create',
            'units.update',
            'sectors.view',
            'sectors.create',
            'sectors.update',
            'processes.view',
            'processes.create',
            'processes.update',
            'activities.view',
            'activities.create',
            'activities.update',
            'people.view',
            'people.create',
            'people.update',
            'users.view',
            'questionnaires.view',
            'questionnaires.create',
            'questionnaires.update',
            'methodologies.view',
            'methodologies.create',
            'methodologies.update',
            'questions.view',
            'questions.create',
            'questions.update',
            'assessments.view',
            'assessments.create',
            'assessments.update',
        ],
        AccessLevel::Administrator->value => self::PERMISSIONS,
    ];

    public static function can(User $user, string $permission): bool
    {
        return in_array($permission, self::forAccessLevel((int) $user->access_level), true);
    }

    /**
     * @return array<string>
     */
    public static function forUser(User $user): array
    {
        return self::forAccessLevel((int) $user->access_level);
    }

    /**
     * @return array<string>
     */
    public static function forAccessLevel(int $accessLevel): array
    {
        return self::MATRIX[$accessLevel] ?? [];
    }

    public static function exists(string $permission): bool
    {
        return in_array($permission, self::PERMISSIONS, true);
    }
}
