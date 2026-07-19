# Tarefa 05 — Opções dos modelos

## Status

CONCLUÍDA.

Data de conclusão: 2026-07-19.

## Resultado

- CRUD administrativo de opções dos modelos implementado no backend e frontend.
- Opção vinculada obrigatoriamente a modelo de avaliação.
- Valor obrigatório e único dentro do modelo.
- Opção possui descrição, ordem e status ativo.
- Permissões de visualização, criação, edição e exclusão adicionadas.
- Endpoint e tela de reordenação por modelo implementados.
- Seeder idempotente criado para opções do `M02`.
- Regra definitiva de conformidade, critérios e execução não foram implementados.

## Validações executadas

- `php -l` nos arquivos PHP alterados e criados.
- `php vendor/bin/pint` nos arquivos PHP alterados e criados.
- `php artisan migrate --pretend`.
- `php artisan route:list --path=evaluation-model-options`.
- `php artisan test` executado, mas bloqueado por ausência de `pdo_sqlite` no ambiente.
- `npm run lint` executado com sucesso, mantendo dois avisos preexistentes em `src/pages/assessments/AssessmentsList.jsx`.
- `npm run build` executado com sucesso, com aviso de chunk acima de 500 kB.

## Pendências residuais

- Habilitar `pdo_sqlite` no PHP do ambiente para executar a suíte backend completa.
- Definir futuramente regras de conformidade e geração de desvios em tarefa específica.


## Objetivo

Implementar as opções ou condições de atendimento de cada modelo.

## Pré-condições

- tarefas anteriores concluídas;
- tarefa movida de `pending` para `active`;
- leitura de `AGENTS.md` e `docs/architecture/*`;
- revisão da implementação atual antes de criar novas estruturas.

## Escopo

- CRUD de opções;
- valor, descrição, ordem e status;
- vínculo com modelo;
- unicidade coerente;
- ordenação e testes;

## Fora do escopo ou dependências

- regra definitiva de conformidade;
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
