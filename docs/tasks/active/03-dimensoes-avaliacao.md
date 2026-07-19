# Tarefa 03 — Dimensões de avaliação

## Status

ATIVA.

## Objetivo

Implementar dimensões vinculadas a metodologias.

## Pré-condições

- tarefas anteriores concluídas;
- tarefa movida de `pending` para `active`;
- leitura de `AGENTS.md` e `docs/architecture/*`;
- revisão da implementação atual antes de criar novas estruturas.

## Escopo

- CRUD de dimensões;
- vínculo obrigatório com metodologia;
- código, nome, objetivo, ordem e status;
- ordenação;
- permissões e testes;

## Fora do escopo ou dependências

- modelos;
- critérios;
- supervisões;

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
