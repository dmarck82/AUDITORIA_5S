# R03 — Critérios de Verificação 5S

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Implementar o catálogo de Critérios de Verificação como perguntas padrão
globais, usando exclusivamente 5S.

## Pré-condições

- R01 e R02 concluídas;
- tarefa movida para `active`.

## Escopo

- criar entidade, migration, API, permissões e frontend dos critérios;
- manter código, texto da pergunta e estado ativo;
- não incluir descrição ou Modelo de Avaliação;
- criar seed 5S somente após os critérios iniciais serem definidos.

## Decisão de regra

Cada critério é obrigatoriamente classificado por um dos cinco sensos:
Utilização, Ordenação, Limpeza, Padronização ou Disciplina.

## Fora do escopo

- respostas, pontuação, cálculo e não conformidades.

## Resultado

- entidade técnica `VerificationCriterion` e enum `FiveSSense` criados;
- migration `verification_criteria` aplicada no banco de desenvolvimento;
- cadastro mantém somente código, senso, pergunta e estado ativo;
- descrição e Modelo de Avaliação não fazem parte da entidade ou formulário;
- CRUD REST publicado em `/api/verification-criteria`;
- permissões `verification_criteria.*` integradas à matriz de acesso;
- listagem, criação, edição e visualização implementadas no frontend;
- item “Critérios de Verificação” adicionado ao menu.

## Validações executadas

- 4 testes funcionais específicos, com 31 asserções;
- suíte completa com 10 testes e 59 asserções;
- migrations e seeder recriados com sucesso em banco MySQL isolado;
- migration aplicada e estrutura conferida no banco de desenvolvimento;
- 5 rotas REST confirmadas por `php artisan route:list`;
- Laravel Pint;
- `composer validate --no-check-publish`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

## Decisões técnicas

- os valores técnicos dos sensos são `utilization`, `ordering`, `cleaning`,
  `standardization` e `discipline`;
- os rótulos preservam a nomenclatura histórica do projeto;
- o código do critério é único globalmente;
- perfis de consulta visualizam critérios, gestores podem criar e atualizar e
  administradores possuem também exclusão.

## Pendências residuais

O seed de critérios não foi criado porque as perguntas iniciais ainda não foram
definidas. Isso não impede o aceite do CRUD da R03.
