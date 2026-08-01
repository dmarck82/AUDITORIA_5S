# R08 — Fluxo e acesso hierárquico das Supervisões

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Adequar Supervisões ao fluxo operacional aprovado, ao escopo organizacional
dos operadores e à transferência auditável de responsabilidade.

## Regras aprovadas

O fluxo é:

```text
Rascunho → Pendente de resposta → Em preenchimento → Respondida → Finalizada
```

- Administrador possui escopo global;
- Gerente visualiza seu escopo, cria supervisões nele, responde, finaliza e
  exclui somente rascunhos criados por ele;
- Operador visualiza seu escopo e responde, mas não cria nem exclui;
- Respondente visualiza e responde somente supervisões atribuídas a ele;
- Visualizador fica sem acesso a Supervisões até definição posterior;
- Local 2 sem Local 3 abrange todos os Locais 3 subordinados;
- quando o usuário possui Local 3, seu escopo fica restrito a esse Local 3;
- Gerente e Operador podem assumir supervisões pendentes ou em preenchimento
  dentro de seu escopo, mediante justificativa obrigatória;
- Respondente não pode localizar nem assumir supervisões de terceiros;
- toda transferência preserva responsável anterior, novo responsável,
  executor, justificativa, data e hora.

## Escopo

- ampliar os estados e implementar transições explícitas;
- permitir preenchimento parcial antes da entrega das respostas;
- aplicar filtros e autorizações hierárquicas na API;
- filtrar ambientes e responsáveis disponíveis na criação;
- registrar e exibir o histórico de transferências;
- expor ações permitidas por supervisão;
- adaptar frontend, seed demonstrativo e testes.

## Fora do escopo

- fluxo de devolução para ajustes;
- aprovação adicional após a finalização;
- definição do acesso do Visualizador;
- supervisão de verificação, eficácia ou 5W2H;
- alterações nas regras de pontuação e não conformidade.

## Critérios de aceite

- transições inválidas são recusadas pela API;
- somente criador ou Administrador configura e envia um rascunho;
- resposta e entrega respeitam responsabilidade e escopo;
- Gerente e Operador podem assumir dentro do escopo com justificativa;
- listagem e visualização não expõem supervisões fora do escopo;
- Gerente cria apenas para ambientes e usuários do próprio escopo;
- exclusão respeita status, perfil e autoria;
- histórico de responsabilidade aparece na supervisão;
- Respondente encontra e responde uma supervisão atribuída;
- testes, lint e build passam.

## Resultado

- implementado o fluxo completo com cinco estados e transições explícitas;
- implementados preenchimento parcial e entrega validada das respostas;
- aplicados filtros e autorizações por perfil, Local 2 e Local 3;
- restringidas criação, exclusão, resposta e finalização conforme as regras
  aprovadas;
- implementada a assunção de responsabilidade por Gerente e Operador, com
  justificativa obrigatória e histórico auditável;
- adaptados API, frontend, seed demonstrativo e recursos de apresentação;
- criada supervisão pendente para a conta respondente do Almoxarifado.

## Validações executadas

- `DB_CONNECTION=mysql DB_DATABASE=auditoria_5s_test php artisan test --filter=SupervisionTest` — 6 testes e 85 asserções;
- `DB_CONNECTION=mysql DB_DATABASE=auditoria_5s_test php artisan test --filter=WarehouseDemoSeederTest` — 1 teste e 39
  asserções;
- `DB_CONNECTION=mysql DB_DATABASE=auditoria_5s_test php artisan test` — 24 testes e 222 asserções;
- `DB_CONNECTION=mysql DB_DATABASE=auditoria_5s_test php artisan
  migrate:fresh --seed --no-interaction`;
- migração incremental e seed idempotente no banco local de desenvolvimento;
- `php artisan migrate:status` e `php artisan route:list --path=supervisions`;
- Laravel Pint nos arquivos da tarefa;
- `composer validate --no-check-publish`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

## Decisões técnicas

- o status não é editável diretamente: cada transição possui uma ação própria;
- a supervisão mantém o responsável inicial no snapshot e o responsável atual
  na associação operacional;
- escopo hierárquico é calculado a partir dos snapshots dos Locais, preservando
  o acesso histórico mesmo após alterações cadastrais;
- permissões de interface são fornecidas por registro, mas toda autorização é
  novamente validada no backend;
- a transferência mantém as respostas já salvas e move o estado para Em
  preenchimento.

## Pendências residuais

- o papel definitivo do perfil Visualizador continua pendente por decisão
  humana e permaneceu fora do escopo aprovado;
- devolução para ajustes, aprovação adicional, supervisão de verificação,
  eficácia e 5W2H continuam fora desta tarefa.
