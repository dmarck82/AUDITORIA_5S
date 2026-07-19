# Tarefa 16 — Plano de ação 5W2H

## Status

PENDENTE.

## Objetivo

Implementar planos de ação vinculados às não conformidades.

## Pré-condições

- tarefas anteriores concluídas;
- tarefa movida de `pending` para `active`;
- leitura de `AGENTS.md` e `docs/architecture/*`;
- revisão da implementação atual antes de criar novas estruturas.

## Escopo

- What;
- Why;
- Where;
- When;
- Who;
- How;
- How much;
- status, prazos e testes;

## Fora do escopo ou dependências

- workflow de aprovação;
- geração assistida por IA;

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
