<?php

namespace App\Enums;

enum SupervisionStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Answered = 'answered';
    case Finalized = 'finalized';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Rascunho',
            self::Pending => 'Pendente de resposta',
            self::InProgress => 'Em preenchimento',
            self::Answered => 'Respondida',
            self::Finalized => 'Finalizada',
        };
    }
}
