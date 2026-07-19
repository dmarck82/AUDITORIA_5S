# Status

Concluída. Implementação registrada em `docs/architecture/implementation-status.md`.

# Tarefa 01 — Processos e atividades

## Estado

Modelo inicial. Revise usando:

```text
docs/architecture/current-system-assessment.md
```

Não executar antes da conclusão e revisão da Tarefa 00.

## Objetivo

Implementar o módulo administrativo de processos e atividades, reaproveitando organizações, unidades, setores e demais entidades existentes.

## Pré-condições

Ler:

- `AGENTS.md`;
- `docs/architecture/domain-model.md`;
- `docs/architecture/roadmap.md`;
- `docs/architecture/current-system-assessment.md`.

Confirmar:

- nível organizacional do processo;
- padrões Laravel e React;
- estruturas reutilizáveis;
- conflitos de nomenclatura.

## Escopo backend

- migrations;
- models;
- relacionamentos;
- Form Requests;
- API Resources quando aplicável;
- controllers, actions ou services;
- rotas;
- policies;
- testes de feature;
- factories quando aplicáveis.

## Escopo frontend

- listagem de processos;
- criação e edição;
- atividades por processo;
- criação e edição de atividade;
- ordenação;
- ativação e desativação;
- loading;
- erros;
- confirmações.

## Regras mínimas

- processo pertence ao nível definido no relatório;
- atividade pertence a um processo;
- nomes são obrigatórios;
- atividade possui ordem;
- registros possuem status;
- duplicações seguem o padrão do projeto;
- não duplicar tabelas;
- preservar compatibilidade.

## Fora do escopo

- metodologias;
- dimensões;
- critérios;
- modelos;
- opções;
- associação atividade-critério;
- aspectos;
- supervisão;
- respostas;
- cálculo;
- não conformidades;
- planos de ação;
- indicadores.

## Critérios de aceite

- migrations executam e revertem;
- relacionamentos funcionam;
- endpoints possuem validação;
- autorização aplicada;
- CRUDs funcionam;
- ordenação funciona;
- ativação funciona;
- testes passam;
- frontend compila;
- lint passa quando configurado;
- nenhuma funcionalidade existente é quebrada.

## Saída esperada

Informar:

- implementado;
- arquivos alterados;
- banco;
- API;
- frontend;
- validações;
- decisões;
- pendências;
- sugestão de commit.

Não criar commit.

## Prompt para o Codex CLI

```text
Execute a tarefa docs/tasks/completed/01-processos-e-atividades.md.

Leia o AGENTS.md, os documentos de domínio e o relatório de inspeção.
Apresente um plano curto antes de modificar arquivos.
Implemente somente o escopo definido.
Execute testes e build aplicáveis.
Não faça commit.
```
