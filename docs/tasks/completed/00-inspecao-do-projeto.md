# Status

Concluída.

# Tarefa 00 — Inspecionar o projeto atual

## Objetivo

Comparar o sistema existente com:

- `AGENTS.md`;
- `docs/architecture/domain-model.md`;
- `docs/architecture/roadmap.md`.

Não modificar código nesta tarefa.

## Atividades

### Examinar

Ler:

- `composer.json`;
- `package.json`;
- configurações;
- migrations;
- models;
- rotas;
- controllers;
- requests;
- resources;
- policies;
- services;
- actions;
- testes;
- serviços de API do frontend;
- páginas;
- componentes.

### Mapear conceitos

Identificar o que já existe para:

- organização;
- unidade;
- OMDS;
- setor;
- subsetor;
- processo;
- atividade;
- metodologia;
- dimensão ou senso;
- critério;
- modelo;
- opção;
- checklist;
- pergunta;
- alternativa;
- auditoria ou supervisão;
- resposta;
- evidência;
- não conformidade;
- plano de ação.

### Criar matriz

```text
Conceito | Implementação atual | Pode reaproveitar? | Alteração necessária
```

### Identificar riscos

- inconsistências;
- duplicações;
- riscos de migration;
- riscos de perda de dados;
- dependências;
- nomenclaturas conflitantes;
- relacionamentos incompletos;
- autorização;
- testes ausentes;
- funcionalidades incompletas.

### Propor primeira etapa

Deve ser pequena, reversível, revisável e não depender de regra indefinida.

## Restrições

- não alterar arquivos existentes;
- não criar migrations;
- não instalar dependências;
- não executar comandos destrutivos;
- não inventar regras;
- não implementar funcionalidades;
- não fazer commit.

## Saída esperada

Criar somente:

```text
docs/architecture/current-system-assessment.md
```

O relatório deve conter:

1. resumo da arquitetura;
2. estrutura atual do banco;
3. API atual;
4. frontend atual;
5. matriz de reaproveitamento;
6. conflitos;
7. riscos;
8. dúvidas de negócio;
9. plano incremental;
10. primeira tarefa recomendada.

## Prompt para o Codex CLI

```text
Leia o AGENTS.md e os documentos em docs/architecture.

Execute a tarefa descrita em:
docs/tasks/completed/00-inspecao-do-projeto.md

Não altere código. Produza somente o relatório solicitado.
Antes de começar, apresente um plano curto.
```
