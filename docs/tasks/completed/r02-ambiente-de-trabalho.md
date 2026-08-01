# R02 — Ambiente de Trabalho

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Implementar o cadastro de Ambiente de Trabalho como local supervisionável,
substituindo completamente o conceito antigo de Processo.

## Pré-condições

- R01 concluída;
- tabela `work_environments` criada;
- esta tarefa como única tarefa em `active`.

## Escopo

- criar o model técnico `WorkEnvironment`;
- implementar Factory, Form Requests, Resources e Controller;
- expor CRUD REST em `/api/work-environments`;
- criar permissões `work_environments.*`;
- implementar listagem, criação, edição e visualização no frontend;
- adicionar “Ambiente de Trabalho” ao menu;
- manter vínculo obrigatório com Local 3;
- proteger exclusão de Local 3 com ambientes vinculados;
- validar backend, banco e frontend.

## Fora do escopo

- Critérios de Verificação;
- supervisões, respostas, cálculo e não conformidades;
- qualquer retorno de Processos ou Atividades.

## Critérios de aceite

- Ambiente de Trabalho é cadastrável sem Atividades;
- API, permissões e frontend usam apenas a nova nomenclatura;
- não existem referências técnicas a Processos ou Atividades;
- testes, lint e build aplicáveis passam;
- não há commit automático.

## Resultado

- model, Factory, Form Requests, Resources e Controller implementados;
- CRUD REST publicado em `/api/work-environments`;
- permissões `work_environments.*` adicionadas à matriz de acesso;
- listagem, criação, edição e visualização implementadas no frontend;
- item “Ambiente de Trabalho” adicionado ao menu;
- vínculo obrigatório e unicidade do nome por Local 3 validados pela API;
- exclusão de Local 3 com ambientes vinculados protegida por relação Eloquent;
- nenhuma referência técnica a Processos ou Atividades permanece no código.

## Validações executadas

- 4 testes funcionais específicos, com 26 asserções;
- suíte completa com 6 testes e 28 asserções;
- migrations e seeder recriados com sucesso em banco MySQL isolado;
- 5 rotas REST confirmadas por `php artisan route:list`;
- Laravel Pint;
- `composer validate --no-check-publish`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`;
- busca técnica por Processo e Atividade sem ocorrências.

## Decisões técnicas

- o nome do ambiente é único dentro do mesmo Local 3, refletindo a restrição
  já existente no banco;
- perfis de consulta visualizam ambientes, gestores podem criar e atualizar e
  administradores possuem também exclusão;
- os testes usaram banco MySQL temporário porque `pdo_sqlite` não está
  instalado; o banco temporário foi removido após as validações.

## Pendências residuais

Nenhuma pendência impede o aceite da R02. Critérios e supervisões permanecem
fora do escopo e seguem para as tarefas R03 e R04.
