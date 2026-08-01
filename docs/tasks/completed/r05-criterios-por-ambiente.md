# R05 — Critérios de Verificação por Ambiente de Trabalho

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Permitir que cada Ambiente de Trabalho possua seu próprio conjunto de Critérios
de Verificação aplicáveis e oferecer uma tela clara para administrar o vínculo.

## Regras confirmadas

- a associação é muitos-para-muitos entre Ambiente de Trabalho e Critério de
  Verificação;
- somente critérios ativos vinculados ao ambiente entram em novas supervisões;
- snapshots de supervisões existentes não são alterados;
- ambiente sem critério ativo vinculado não pode iniciar uma supervisão;
- para preservar o comportamento atual, a migration vincula os critérios ativos
  existentes a todos os ambientes existentes;
- novos ambientes começam sem critérios vinculados.

## Escopo

- criar tabela associativa com chaves estrangeiras e unicidade;
- adicionar relações nos models;
- implementar endpoints para consultar e sincronizar vínculos;
- criar tela de associação com busca, agrupamento por senso e seleção em lote;
- integrar a tela ao módulo Ambiente de Trabalho;
- ajustar a criação da supervisão;
- adicionar testes funcionais.

## Fora do escopo

- pesos diferentes por ambiente;
- personalização de notas ou textos por ambiente;
- alteração dos snapshots de supervisões já criadas;
- ordenação personalizada dos critérios.

## Critérios de aceite

- vínculos podem ser consultados e atualizados conforme permissões;
- a interface permite identificar e selecionar critérios com facilidade;
- supervisão nova contém exatamente os critérios ativos vinculados;
- critérios inativos vinculados não entram na supervisão;
- banco, API e frontend passam nas validações do projeto.

## Resultado

- criada a associação muitos-para-muitos `work_environment_criteria`;
- implementados endpoints de consulta e sincronização dos vínculos;
- criada tela com busca, agrupamento por senso, seleção individual e em lote,
  contadores e modo somente leitura;
- listagem, detalhes e formulário de supervisão exibem contadores de critérios;
- novas supervisões copiam somente critérios ativos vinculados ao ambiente;
- ambientes sem critério ativo vinculado não podem iniciar supervisão;
- a migration preserva compatibilidade vinculando critérios ativos existentes
  aos ambientes existentes.

## Validações executadas

- suíte completa: 19 testes e 145 asserções;
- associação por ambiente: 4 testes e 24 asserções;
- reconstrução do banco MySQL de teste com migrations e seed;
- backfill validado com 1 ambiente, 1 critério ativo e 1 vínculo gerado;
- migration aplicada no banco de desenvolvimento;
- Laravel Pint;
- inspeção das sete rotas de Ambiente de Trabalho;
- lint e build de produção do frontend;
- verificação de integridade do diff.

## Pendências residuais

- pesos, textos e ordenação personalizados por ambiente permanecem fora do
  escopo;
- os documentos antigos em `pending` continuam inelegíveis por representarem o
  domínio anterior à simplificação.
