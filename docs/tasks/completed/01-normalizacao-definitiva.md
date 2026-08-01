# Tarefa N01 — Normalização definitiva do projeto

## Status

CONCLUÍDA — 2026-07-19.

## Resultado

- Estrutura documental definitiva confirmada.
- Referências a caminhos antigos corrigidas na documentação de tarefas concluídas e estado da implementação.
- Implementação de processos e atividades revisada.
- Regra de exclusão de setor com processos vinculados normalizada com retorno 409.
- `implementation-status.md` atualizado com fatos confirmados.
- `roadmap.md` atualizado para ativar a tarefa 02.

## Validações executadas

- `php -l` nos arquivos PHP alterados diretamente.
- `php vendor/bin/pint` nos arquivos PHP alterados.
- `php artisan migrate --pretend`.
- `php artisan route:list --path=processes`.
- `php artisan route:list --path=activities`.
- `php artisan test` executado, com falha ambiental por ausência de `pdo_sqlite`.
- `php -r` confirmou `pdo_sqlite missing`.
- `npm run lint`, concluído com warnings preexistentes em `AssessmentsList.jsx`.
- `npm run build`, concluído com sucesso.

## Pendências residuais

- Habilitar `pdo_sqlite` no ambiente PHP para a suíte Laravel baseada em SQLite em memória.
- Warnings preexistentes de hooks em `auditoria_5s_front/src/pages/assessments/AssessmentsList.jsx`.

## Status anterior

ATIVA — executar uma única vez.

Após a conclusão, este arquivo deve ser movido para `docs/tasks/completed` pelo procedimento permanente de encerramento.

## Objetivo

Adequar a estrutura documental e técnica existente ao fluxo definitivo acordado para o SSEP, preservando as funcionalidades já concluídas.

O fluxo e a estrutura dos arquivos Markdown estão definidos e não devem ser redesenhados.

## Referências obrigatórias

- `AGENTS.md`;
- `docs/tasks/README.md`;
- `docs/architecture/domain-model.md`;
- `docs/architecture/current-system-assessment.md`;
- `docs/architecture/implementation-status.md`;
- `docs/architecture/roadmap.md`.

## Escopo

### Documentação

- confirmar que a estrutura documental corresponde exatamente ao padrão definitivo;
- remover referências a caminhos antigos, quando existirem no projeto;
- preservar o conteúdo histórico relevante;
- garantir que tarefas antigas estejam em `completed`;
- garantir que esta seja a única tarefa em `active`;
- garantir que as próximas tarefas estejam em `pending`;
- não criar outra estrutura paralela de documentação.

### Código e arquitetura

Inspecionar e adequar somente inconsistências estruturais comprovadas relacionadas ao que já foi implementado:

- organização de namespaces e arquivos;
- relacionamentos Eloquent;
- Form Requests e Resources;
- rotas;
- autorização;
- services/actions, somente quando necessários ao padrão existente;
- componentes e serviços de frontend;
- testes do módulo existente;
- nomenclatura técnica claramente inconsistente;
- código morto diretamente relacionado ao módulo já implementado.

### Processos e atividades

Validar a implementação existente:

- processo pertence ao setor;
- atividade pertence ao processo;
- ordenação;
- ativação/desativação;
- criação, edição, consulta e exclusão;
- regras de exclusão com dependências;
- permissões;
- auditoria por `updated_by`, conforme padrão existente;
- testes de backend;
- build e lint do frontend.

## Restrições

- não implementar metodologias;
- não implementar dimensões;
- não implementar critérios;
- não iniciar qualquer tarefa pendente;
- não alterar regra de negócio definida;
- não apagar dados;
- não reescrever o projeto sem necessidade;
- não instalar dependências sem justificativa;
- não alterar a estrutura dos `.md`;
- não fazer commit.

## Critérios de aceite

- estrutura documental definitiva presente e coerente;
- somente esta tarefa em `active` durante a execução;
- tarefas 00 e 01 em `completed`;
- tarefas seguintes em `pending`;
- caminhos antigos de documentação corrigidos;
- processos e atividades funcionando sem regressão;
- relacionamentos e regras de exclusão revisados;
- permissões revisadas;
- testes relevantes executados;
- frontend validado por build e lint existentes;
- `implementation-status.md` atualizado com fatos confirmados;
- `roadmap.md` atualizado;
- nenhum módulo novo iniciado.

## Encerramento

Ao terminar, execute integralmente:

```text
docs/tasks/templates/00-encerrar-tarefa.md
```

A próxima tarefa ativa deverá ser `02-metodologias.md`.

## Prompt para o Codex CLI

```text
Leia AGENTS.md e toda a documentação indicada na tarefa ativa.

Execute exclusivamente:
docs/tasks/completed/01-normalizacao-definitiva.md

Primeiro inspecione o repositório e apresente um plano curto.
Preserve funcionalidades existentes.
Não implemente nenhuma tarefa pendente.
Execute testes, lint e build aplicáveis.
Ao final, execute docs/tasks/templates/00-encerrar-tarefa.md.
Não faça commit.
```
