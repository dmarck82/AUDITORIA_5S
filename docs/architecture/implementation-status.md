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
- tarefas 00, 01, 02, 03, 04 e 05 estão em `docs/tasks/completed`;
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


## Fase 3 — Dimensões de avaliação

Status: concluída.

Escopo implementado:

```text
Metodologia
└── Dimensão de avaliação
```

Fatos confirmados:

- `evaluation_dimensions` pertence a `methodologies` por `methodology_id`;
- dimensões possuem `code`, `name`, `objective`, `sort_order`, `active`, timestamps e `updated_by`;
- `code` é obrigatório, normalizado para maiúsculas e único dentro da metodologia;
- há Model, Factory, Form Requests, Resources, controller, rotas e permissões para dimensões;
- há endpoint de reordenação por metodologia;
- `Methodology` possui relacionamento `evaluationDimensions`;
- a exclusão de metodologia com dimensões retorna conflito;
- o frontend possui listagem, criação, edição e visualização de dimensões;
- o detalhe de metodologia permite criar, editar, excluir e reordenar dimensões;
- modelos de avaliação, critérios e supervisões permanecem fora do escopo.


## Fase 4 — Modelos de avaliação

Status: concluída.

Escopo implementado:

```text
Modelo de avaliação
```

Fatos confirmados:

- `evaluation_models` possui `code`, `name`, `description`, `active`, timestamps e `updated_by`;
- `code` é obrigatório, normalizado para maiúsculas e único;
- há Model, Factory, Form Requests, Resources, controller, rotas e permissões para modelos de avaliação;
- o frontend possui listagem, criação, edição e visualização de modelos de avaliação;
- opções dos modelos, critérios e execução permanecem fora do escopo.


## Fase 5 — Opções dos modelos

Status: concluída.

Escopo implementado:

```text
Modelo de avaliação
└── Opção do modelo
```

Fatos confirmados:

- `evaluation_model_options` pertence a `evaluation_models` por `evaluation_model_id`;
- opções possuem `value`, `description`, `sort_order`, `active`, timestamps e `updated_by`;
- `value` é obrigatório e único dentro do modelo de avaliação;
- há Model, Factory, Form Requests, Resources, controller, rotas e permissões para opções dos modelos;
- há endpoint de reordenação por modelo de avaliação;
- `EvaluationModel` possui relacionamento `evaluationModelOptions`;
- a exclusão de modelo com opções retorna conflito;
- há seeder idempotente das opções do `M02`;
- o frontend possui listagem, criação, edição e visualização de opções;
- o detalhe do modelo de avaliação permite criar, editar, excluir e reordenar opções;
- regra definitiva de conformidade, critérios e execução permanecem fora do escopo.

## Validações conhecidas

Validações executadas na tarefa 05:

- sintaxe PHP dos arquivos alterados;
- Pint nos arquivos PHP alterados;
- `php artisan migrate --pretend`;
- `php artisan route:list --path=evaluation-model-options`;
- `npm run lint`;
- `npm run build`.

Limitação de ambiente:

- `php artisan test` usa SQLite em memória via `phpunit.xml`, mas a extensão `pdo_sqlite` não está habilitada neste ambiente.

## Tarefa ativa

Cadastro administrativo de critérios universais.

Arquivo:

```text
docs/tasks/active/06-criterios-universais.md
```

## Próxima fase funcional

Iniciar o cadastro de critérios universais vinculados a dimensão e modelo, sem implementar associação com atividades, aspectos ou supervisões.

## Observação

Este documento registra somente fatos confirmados no código e resultados efetivamente validados.
