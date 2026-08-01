<?php

namespace App\Enums;

enum ResponseScore: int
{
    case NotMet = 0;
    case PartiallyMet = 5;
    case MostlyMet = 10;
    case FullyMet = 15;

    public function defaultLabel(): string
    {
        return match ($this) {
            self::NotMet => 'Não atende ao requisito',
            self::PartiallyMet => 'Atende parcialmente, com falhas relevantes',
            self::MostlyMet => 'Atende, com pequenas oportunidades de melhoria',
            self::FullyMet => 'Atende plenamente ao padrão estabelecido',
        };
    }

    public function fieldName(): string
    {
        return 'response_'.$this->value.'_label';
    }

    /** @return array<int> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
