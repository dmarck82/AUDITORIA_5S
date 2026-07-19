# Tarefa 04 — Modelos de avaliação

## Status

CONCLUÍDA.

Data de conclusão: 2026-07-19.

## Resultado

- CRUD administrativo de modelos de avaliação implementado no backend e frontend.
- Código de modelo obrigatório, normalizado para maiúsculas e único.
- Modelo de avaliação possui nome, descrição e status ativo.
- Permissões de visualização, criação, edição e exclusão adicionadas.
- Opções dos modelos, critérios e execução não foram implementados.

## Validações executadas

- `php -l` nos arquivos PHP alterados e criados.
- `php vendor/bin/pint` nos arquivos PHP alterados e criados.
- `php artisan migrate --pretend`.
- `php artisan route:list --path=evaluation-models`.
- `php artisan test` executado, mas bloqueado por ausência de `pdo_sqlite` no ambiente.
- `npm run lint` executado com sucesso, mantendo dois avisos preexistentes em `src/pages/assessments/AssessmentsList.jsx`.
- `npm run build` executado com sucesso, com aviso de chunk acima de 500 kB.

## Pendências residuais

- Habilitar `pdo_sqlite` no PHP do ambiente para executar a suíte backend completa.


## Objetivo

Implementar modelos de avaliação reutilizáveis.

## Pré-condições

- tarefas anteriores concluídas;
- tarefa movida de `pending` para `active`;
- leitura de `AGENTS.md` e `docs/architecture/*`;
- revisão da implementação atual antes de criar novas estruturas.

## Escopo

- CRUD de modelos;
- código único;
- nome, descrição e status;
- permissões e testes;

## Fora do escopo ou dependências

- opções dos modelos;
- critérios;
- execução;

## Critérios gerais de aceite

- seguir padrões existentes do backend e frontend;
- migrations reversíveis;
- validação e autorização;
- testes relevantes passando;
- lint e build aplicáveis;
- documentação de estado atualizada;
- nenhuma regressão conhecida;
- nenhum commit automático.

## Encerramento

Ao terminar, execute:

```text
docs/tasks/templates/00-encerrar-tarefa.md
```

## Prompt para o Codex CLI

```text
Leia AGENTS.md, docs/architecture e a única tarefa em docs/tasks/active.
Execute somente a tarefa ativa.
Apresente um plano curto antes de alterar código.
Não implemente itens fora do escopo.
Execute testes, lint e build aplicáveis.
Ao final, execute docs/tasks/templates/00-encerrar-tarefa.md.
Não faça commit.
```
