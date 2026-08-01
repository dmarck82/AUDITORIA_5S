# Estrutura definitiva de tarefas

Esta estrutura está congelada e passa a ser o padrão oficial do projeto.

```text
docs/tasks/
├── active/
├── completed/
├── pending/
└── templates/
```

## Regras

### `active`

Contém exatamente uma tarefa em execução.

### `completed`

Contém tarefas concluídas e validadas. Tarefas concluídas não devem ser reexecutadas.

### `pending`

Contém tarefas planejadas que ainda não foram iniciadas.

### `templates`

Contém procedimentos permanentes. Esses arquivos não representam funcionalidades e não são movidos.

## Fluxo oficial

```text
pending → active → completed
```

Uma tarefa só pode ir para `completed` quando seus critérios de aceite forem atendidos ou quando o próprio arquivo registrar claramente quais itens foram formalmente retirados do escopo.

Se a tarefa não estiver concluída, ela permanece em `active`.

## Vantagens assumidas

- estado visível no repositório;
- continuidade entre sessões do Codex;
- apenas uma prioridade ativa;
- histórico claro de entregas;
- tarefas pequenas e revisáveis;
- redução de retrabalho e reimplementação.

## Limitações assumidas

- exige disciplina para executar o encerramento;
- o backlog pode ficar extenso;
- mudanças urgentes precisam virar tarefa própria;
- tarefas dependentes de regra indefinida podem permanecer bloqueadas;
- documentação precisa ser atualizada junto com o código.

Esses prós e contras são aceitos como parte do processo e não justificam alterar a estrutura.
