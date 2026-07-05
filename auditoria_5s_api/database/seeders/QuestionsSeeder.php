<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Questionnaire;
use Illuminate\Database\Seeder;

class QuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $questionnaire = Questionnaire::query()
            ->where('name', '5S Standard Assessment')
            ->firstOrFail();

        $questions = [
            ['SORT', 'Materiais desnecessários foram removidos da área de trabalho?'],
            ['SORT', 'Equipamentos sem uso estão identificados e destinados corretamente?'],
            ['SORT', 'Documentos físicos e digitais obsoletos foram eliminados ou arquivados?'],
            ['SORT', 'Há apenas ferramentas e materiais necessários para a rotina da área?'],
            ['SORT', 'Itens pessoais não interferem na organização e segurança do ambiente?'],
            ['SET_IN_ORDER', 'Ferramentas e materiais possuem locais definidos e identificados?'],
            ['SET_IN_ORDER', 'Os itens de uso frequente estão acessíveis sem esforço desnecessário?'],
            ['SET_IN_ORDER', 'Armários, gavetas e prateleiras estão organizados por finalidade?'],
            ['SET_IN_ORDER', 'Sinalizações visuais facilitam a localização de recursos importantes?'],
            ['SET_IN_ORDER', 'Cabos, equipamentos e mobiliário estão dispostos de forma segura?'],
            ['SHINE', 'A área de trabalho está limpa e livre de resíduos acumulados?'],
            ['SHINE', 'Equipamentos, mesas e superfícies são limpos com frequência adequada?'],
            ['SHINE', 'Problemas de conservação são identificados e comunicados rapidamente?'],
            ['SHINE', 'Lixeiras e pontos de descarte estão adequados e sem excesso de material?'],
            ['SHINE', 'A limpeza contribui para identificar falhas, vazamentos ou riscos no ambiente?'],
            ['STANDARDIZE', 'Existem padrões visuais claros para organização e limpeza da área?'],
            ['STANDARDIZE', 'As rotinas de 5S estão documentadas e disponíveis para a equipe?'],
            ['STANDARDIZE', 'Responsabilidades de organização e limpeza estão definidas?'],
            ['STANDARDIZE', 'Os padrões definidos são aplicados de forma consistente por todos?'],
            ['STANDARDIZE', 'A equipe utiliza indicadores ou checklists para manter o padrão da área?'],
            ['SUSTAIN', 'A liderança acompanha regularmente a manutenção do 5S?'],
            ['SUSTAIN', 'A equipe demonstra disciplina para manter os padrões sem cobrança constante?'],
            ['SUSTAIN', 'Desvios identificados em avaliações anteriores foram tratados?'],
            ['SUSTAIN', 'Novos colaboradores recebem orientação sobre os padrões 5S da área?'],
            ['SUSTAIN', 'Há melhoria contínua nas práticas de organização, limpeza e padronização?'],
        ];

        foreach ($questions as $index => [$category, $question]) {
            Question::query()->updateOrCreate(
                [
                    'questionnaire_id' => $questionnaire->id,
                    'sort_order' => $index + 1,
                ],
                [
                    'category' => $category,
                    'question' => $question,
                    'description' => null,
                    'active' => true,
                ]
            );
        }
    }
}
