<?php

namespace App\Enums;

enum FiveSSense: string
{
    case Utilization = 'utilization';
    case Ordering = 'ordering';
    case Cleaning = 'cleaning';
    case Standardization = 'standardization';
    case Discipline = 'discipline';

    public function label(): string
    {
        return match ($this) {
            self::Utilization => 'Utilização',
            self::Ordering => 'Ordenação',
            self::Cleaning => 'Limpeza',
            self::Standardization => 'Padronização',
            self::Discipline => 'Disciplina',
        };
    }

    public function codePrefix(): string
    {
        return match ($this) {
            self::Utilization => 'UTIL',
            self::Ordering => 'ORD',
            self::Cleaning => 'LIMP',
            self::Standardization => 'PAD',
            self::Discipline => 'DISC',
        };
    }

    /** @return array<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
