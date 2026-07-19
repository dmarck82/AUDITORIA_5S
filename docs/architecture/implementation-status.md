# Estado atual da implementação do SSEP

## Estrutura documental

Status: adotada como estrutura definitiva.

O controle das tarefas utiliza:

```text
docs/tasks/active
docs/tasks/completed
docs/tasks/pending
docs/tasks/templates
```

Estado confirmado:

- existe exatamente uma tarefa em `docs/tasks/active`;
- tarefas 00, 01 e 02 estão em `docs/tasks/completed`;
- tarefas funcionais seguintes estão em `docs/tasks/pending`;
- `docs/tasks/templates/00-encerrar-tarefa.md` permanece como procedimento permanente.

## Fase 0 — Inspeção do projeto

Status: concluída.

Relatório de referência:

```text
docs/architecture/current-system-assessment.md
```

## Fase 1 — Processos e atividades

Status: concluída e normalizada.

Escopo implementado:

```text
Setor
└── Processo
    └── Atividade
```

Fatos confirmados:

- `processes` pertence a `sectors` por `sector_id`;
- `activities` pertence a `processes` por `process_id`;
- atividades possuem `sort_order`, `active`, timestamps e `updated_by`;
- processos possuem `active`, timestamps e `updated_by`;
- `Sector` possui relacionamento `processes`;
- `Process` possui relacionamentos `sector` e `activities`;
- `Activity` possui relacionamento `process`;
- há Form Requests, Resources, controllers, rotas e permissões para processos e atividades;
- a exclusão de processo com atividades retorna conflito;
- a exclusão de setor com processos retorna conflito;
- há reordenação de atividades por processo;
- o frontend possui listagem, criação, edição e visualização de processos;
- o frontend permite criar, editar, excluir e reordenar atividades dentro do processo;
- há seeder idempotente de processos e atividades para dados de teste.

Decisão técnica vigente:

- processo pertence ao setor enquanto `subsetor` e OMDS permanecem sem definição de negócio.

## Fase 2 — Metodologias

Status: concluída.

Escopo implementado:

```text
Metodologia
```

Fatos confirmados:

- `methodologies` possui `code`, `name`, `description`, `active`, timestamps e `updated_by`;
- `code` é obrigatório, normalizado para maiúsculas e único;
- há Model, Factory, Form Requests, Resources, controller, rotas e permissões para metodologias;
- há seeder idempotente com `5S` e `GA`;
- o frontend possui listagem, criação, edição e visualização de metodologias;
- dimensões, critérios e supervisões permanecem fora do escopo.

## Validações conhecidas

Validações executadas na tarefa 02:

- sintaxe PHP dos arquivos alterados;
- Pint nos arquivos PHP alterados;
- `php artisan migrate --pretend`;
- `php artisan route:list --path=methodologies`;
- `npm run lint`;
- `npm run build`.

Limitação de ambiente:

- `php artisan test` usa SQLite em memória via `phpunit.xml`, mas a extensão `pdo_sqlite` não está habilitada neste ambiente.

## Tarefa ativa

Cadastro administrativo de dimensões de avaliação.

Arquivo:

```text
docs/tasks/active/03-dimensoes-avaliacao.md
```

## Próxima fase funcional

Iniciar o cadastro de dimensões vinculadas a metodologias, sem implementar modelos, critérios ou supervisões.

## Observação

Este documento registra somente fatos confirmados no código e resultados efetivamente validados.
