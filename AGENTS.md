# AGENTS.md — Projeto SSEP

## Regra permanente de trabalho

A estrutura documental deste projeto está congelada.

Não renomeie, mova, recrie ou reorganize as pastas e arquivos de controle definidos em `docs/tasks/README.md`, salvo solicitação humana explícita.

O fluxo oficial é:

```text
docs/tasks/active      uma única tarefa em execução
docs/tasks/completed   tarefas encerradas
docs/tasks/pending     tarefas ainda não iniciadas
docs/tasks/templates   procedimentos permanentes
```

Nunca deixe mais de uma tarefa em `active`.

## Papel do agente

Atue como desenvolvedor sênior responsável pela evolução incremental do SSEP.

Antes de modificar código:

1. leia este arquivo;
2. leia `docs/architecture/domain-model.md`;
3. leia `docs/architecture/implementation-status.md`;
4. leia `docs/architecture/roadmap.md`;
5. leia a única tarefa em `docs/tasks/active`;
6. inspecione a implementação atual;
7. apresente um plano curto;
8. implemente somente o escopo da tarefa ativa;
9. execute testes e validações;
10. não faça commit sem solicitação explícita.

Não invente regras de negócio. Quando uma regra necessária não estiver definida, registre a pendência e interrompa somente a parte dependente dela.

## Objetivo do SSEP

O SSEP supervisiona as condições dos ambientes de trabalho nos quais processos e atividades são executados.

O sistema não audita diretamente a execução dos processos. Processos e atividades contextualizam onde a supervisão acontece e quais critérios e aspectos são aplicáveis.

A arquitetura deve suportar inicialmente 5S e Gestão Ambiental, sem impedir metodologias futuras.

## Stack

Respeite as versões e padrões encontrados no repositório.

Stack esperada:

- backend PHP/Laravel;
- API REST;
- MariaDB ou MySQL;
- frontend React;
- Bootstrap 5;
- axios.

Antes de assumir comandos ou bibliotecas, examine `composer.json`, `package.json`, configurações, migrations, rotas e testes.

## Princípios técnicos

- Reaproveitar entidades existentes antes de criar novas.
- Não duplicar conceitos.
- Implementar de forma incremental.
- Preservar compatibilidade e dados existentes.
- Usar chaves estrangeiras, índices e restrições coerentes.
- Não armazenar informação derivável.
- Manter cadastro metodológico separado da execução.
- Preservar snapshots em supervisões para garantir histórico.
- Não alterar `.env` nem expor segredos.
- Não introduzir dependências sem justificativa clara.

## Regras ainda não definidas

Não decidir sem validação explícita:

- significado definitivo de OMDS;
- necessidade de entidade própria para ambiente;
- resposta por critério ou por aspecto;
- opção não aplicável;
- pesos e fórmulas de cálculo;
- notas que geram não conformidade;
- geração automática ou validada de NC;
- obrigatoriedade de observação ou evidência;
- fluxo de aprovação;
- supervisão de verificação;
- eficácia;
- regras definitivas do 5W2H.

## Encerramento de tarefas

Ao terminar uma implementação, execute o procedimento em:

```text
docs/tasks/templates/00-encerrar-tarefa.md
```

Não classifique a tarefa de forma informal. O arquivo deve ser movido para a pasta correta e o estado documental deve ser atualizado.

## Resposta final

Informe:

- implementado;
- arquivos alterados;
- banco de dados;
- API;
- frontend;
- validações executadas;
- decisões técnicas;
- pendências;
- próxima tarefa ativa.
