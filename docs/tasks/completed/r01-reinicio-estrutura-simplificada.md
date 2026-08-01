# R01 — Reinício da estrutura simplificada

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Reiniciar a base técnica do SSEP para o escopo simplificado: níveis locais,
Usuários, Operadores e Ambiente de Trabalho.

## Decisões humanas confirmadas

- Processo passa a ser Ambiente de Trabalho;
- Atividades deixam de existir;
- somente 5S será utilizado;
- Modelos de Avaliação, Questionários e Perguntas deixam de existir;
- migrations e seeders anteriores podem ser substituídos;
- os dados de desenvolvimento não precisam ser preservados.

## Resultado

- migrations e seeders legados removidos e recriados;
- banco local recriado do zero;
- estrutura mínima funcional preservada;
- tabela `work_environments` criada para a próxima etapa;
- backend, API, permissões e frontend reduzidos aos módulos mantidos;
- autenticação de Operador validada;
- arquivos legados removidos do projeto sem commit automático.

## Validações executadas

- `php artisan migrate:fresh --seed`;
- `php artisan migrate:status`;
- inspeção de esquema e dados mínimos;
- login JWT e endpoints autenticados via HTTP;
- `php artisan route:list`;
- `php artisan test`;
- Laravel Pint;
- `composer validate --no-check-publish`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

## Pendências residuais

- implementar o CRUD de Ambiente de Trabalho na R02;
- implementar Critérios de Verificação na R03;
- definir regras de supervisão antes da R04.
