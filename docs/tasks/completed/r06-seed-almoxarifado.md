# R06 — Seed demonstrativo do Almoxarifado

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Substituir o cenário mínimo de desenvolvimento por dados coerentes para
validação do SSEP em um setor de almoxarifado.

## Regras confirmadas

- Local 1: `AMAN`;
- Local 2: `Base Administrativa`;
- Local 3: `Almoxarifado`;
- o login administrativo continua sendo `admin@admin.com.br`;
- todas as contas usam temporariamente a senha `resende123`;
- devem existir usuários e operadores que permitam validar todos os níveis de
  acesso;
- devem existir critérios 5S aplicáveis ao ambiente e uma supervisão de
  demonstração.

## Escopo

- tornar o seed idempotente;
- criar estrutura organizacional e um Ambiente de Trabalho de armazenagem;
- criar uma conta para cada perfil de acesso;
- criar critérios realistas distribuídos pelos cinco sensos;
- vincular os critérios ao ambiente;
- criar uma supervisão finalizada com respostas variadas;
- adicionar teste funcional do cenário completo.

## Fora do escopo

- dados oficiais ou pessoais reais;
- anexos físicos de evidência;
- múltiplos ambientes ou múltiplas supervisões demonstrativas;
- alteração das regras de permissão.

## Critérios de aceite

- `migrate:fresh --seed` gera o cenário sem intervenção manual;
- executar o seed novamente não duplica os registros do cenário;
- as cinco contas autenticam com a senha temporária;
- o ambiente possui critérios de todos os sensos;
- a supervisão finalizada apresenta cálculo, não conformidades e não aplicável.

## Resultado

- criado o cenário `AMAN → Base Administrativa → Almoxarifado`;
- criado o Ambiente de Trabalho `Área de Armazenagem do Almoxarifado`;
- criados cinco usuários e cinco operadores, um por nível de acesso;
- mantido `admin@admin.com.br` e aplicada a senha temporária `resende123` a
  todas as contas;
- criados 20 critérios, quatro para cada senso 5S, e vinculados ao ambiente;
- criada uma supervisão finalizada com 20 respostas, 1 não aplicável, 9 não
  conformidades e resultado de 52,63%;
- seed implementado de forma idempotente e carregado no banco de
  desenvolvimento sem excluir outros dados.

## Validações executadas

- `migrate:fresh --seed` no banco MySQL de teste;
- seed executado duas vezes nos bancos de teste e desenvolvimento;
- teste específico: 1 teste e 34 asserções;
- suíte completa: 20 testes e 179 asserções;
- autenticação confirmada para as cinco contas;
- hierarquia, vínculos, contagens e cálculo inspecionados no banco de
  desenvolvimento;
- Laravel Pint;
- integridade do diff.

## Pendências residuais

- as senhas compartilhadas são exclusivamente temporárias para validação;
- dados pessoais, anexos físicos e outros cenários demonstrativos permanecem
  fora do escopo.
