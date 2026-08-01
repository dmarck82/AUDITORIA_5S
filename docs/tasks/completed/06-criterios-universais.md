# Tarefa 06 — Critérios universais

## Status

CONCLUÍDA em 2026-07-19.

## Objetivo

Implementar critérios universais vinculados a dimensão e modelo.

## Pré-condições

- tarefas anteriores concluídas;
- tarefa movida de `pending` para `active`;
- leitura de `AGENTS.md` e `docs/architecture/*`;
- revisão da implementação atual antes de criar novas estruturas.

## Escopo

- CRUD de critérios;
- código único;
- texto universal;
- vínculo com dimensão;
- vínculo com modelo;
- status, permissões e testes;

## Fora do escopo ou dependências

- associação com atividades;
- aspectos;
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

## Resultado

Implementado cadastro administrativo de critérios universais.

Fatos confirmados:

- criada tabela `criteria` com vínculo obrigatório a `evaluation_dimensions` e `evaluation_models`;
- `code` é obrigatório, normalizado para maiúsculas e único globalmente;
- `text` armazena o texto universal obrigatório;
- `description`, `active`, timestamps e `updated_by` foram incluídos;
- há Model, Factory, Form Requests, Resources, controller, rotas e permissões para critérios;
- há seeder idempotente de critérios universais;
- a API permite listar, criar, visualizar, editar, excluir e filtrar por dimensão ou modelo;
- dimensões e modelos com critérios vinculados retornam conflito ao tentar excluir;
- o frontend possui listagem, criação, edição e visualização de critérios;
- a navegação inclui Critérios Universais no menu Modelos;
- associação com atividades, aspectos e supervisões não foi implementada.

Validações executadas:

- sintaxe PHP dos arquivos novos e alterados;
- Pint nos arquivos PHP da tarefa;
- `php artisan migrate --pretend`;
- `php artisan route:list --path=criteria`;
- `php artisan test` executado, mas bloqueado por ausência de `pdo_sqlite` no ambiente;
- `npm run lint`;
- `npm run build`.

Pendências residuais:

- habilitar `pdo_sqlite` no ambiente local para executar a suíte PHPUnit completa.

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
