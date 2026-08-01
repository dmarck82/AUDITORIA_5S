# Procedimento permanente — Encerrar e classificar a tarefa atual

## Quando executar

Execute este procedimento ao final de cada execução do Codex que tenha trabalhado na tarefa ativa.

Este arquivo é permanente e nunca deve ser movido.

## Objetivo

Classificar corretamente a tarefa em `active`, `completed` ou `pending`, atualizar o estado do projeto e preparar a continuação.

## Etapa 1 — Verificar a tarefa ativa

Liste `docs/tasks/active`.

Deve existir exatamente um arquivo de tarefa.

Se não existir ou existir mais de um:

- pare;
- não mova arquivos;
- informe a inconsistência.

## Etapa 2 — Ler o contexto

Leia:

- `AGENTS.md`;
- `docs/tasks/README.md`;
- `docs/architecture/domain-model.md`;
- `docs/architecture/implementation-status.md`;
- `docs/architecture/roadmap.md`;
- a tarefa ativa.

## Etapa 3 — Verificar o resultado real

Compare a implementação com:

- objetivo;
- escopo;
- fora do escopo;
- critérios de aceite;
- testes e validações exigidos.

Não considere concluído algo que não tenha sido implementado ou validado.

## Etapa 4 — Classificar

### Caso A — Concluída

Quando todos os critérios forem atendidos:

1. registre no arquivo da tarefa:
   - status concluído;
   - data;
   - resumo do resultado;
   - validações executadas;
   - pendências residuais que não impedem o aceite;
2. atualize `docs/architecture/implementation-status.md`;
3. atualize `docs/architecture/roadmap.md`;
4. mova a tarefa de `active` para `completed`;
5. mova a próxima tarefa numericamente elegível de `pending` para `active`;
6. nunca deixe mais de uma tarefa ativa.

### Caso B — Ainda em execução

Quando faltarem critérios de aceite:

1. mantenha a tarefa em `active`;
2. atualize nela:
   - o que foi concluído;
   - o que falta;
   - bloqueios;
   - próxima ação objetiva;
3. atualize `implementation-status.md` somente com fatos confirmados;
4. não ative outra tarefa.

### Caso C — Bloqueada ou devolvida ao backlog

Quando a tarefa não puder continuar por dependência externa ou decisão humana:

1. registre o bloqueio e a decisão necessária;
2. mova a tarefa de `active` para `pending`;
3. marque-a como `BLOQUEADA` no título ou seção de status;
4. ative somente a próxima tarefa que não dependa do mesmo bloqueio;
5. se nenhuma tarefa puder ser ativada, deixe `active` vazia e informe claramente.

## Etapa 5 — Não fazer

- não implementar a próxima tarefa;
- não criar commit;
- não alterar a estrutura das pastas;
- não renumerar tarefas;
- não apagar histórico;
- não declarar testes executados sem executá-los.

## Relatório final obrigatório

```text
Classificação da tarefa: CONCLUÍDA | ATIVA | PENDENTE/BLOQUEADA

Tarefa processada:
...

Arquivo atual:
...

Implementation status atualizado:
Sim/Não

Roadmap atualizado:
Sim/Não

Próxima tarefa ativa:
...

Validações confirmadas:
...

Pendências ou bloqueios:
...
```
