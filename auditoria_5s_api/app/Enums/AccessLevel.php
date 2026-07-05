<?php

namespace App\Enums;

enum AccessLevel: int
{
    case Viewer = 1;
    case Respondent = 2;
    case Operator = 3;
    case Manager = 4;
    case Administrator = 5;

    /**
     * @return array<int>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $level): int => $level->value,
            self::cases(),
        );
    }
}
