# R07 — Códigos automáticos dos Critérios de Verificação

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Gerar automaticamente códigos únicos e sequenciais para Critérios de
Verificação conforme o senso 5S selecionado.

## Regra aprovada

Cada senso possui prefixo e sequência independentes:

- Utilização: `UTIL-001`;
- Ordenação: `ORD-001`;
- Limpeza: `LIMP-001`;
- Padronização: `PAD-001`;
- Disciplina: `DISC-001`.

A sequência é gerada no backend, não reutiliza números após exclusões e deve
ser segura para cadastros simultâneos. Código e senso tornam-se imutáveis após
a criação.

## Escopo

- persistir o último número utilizado por senso;
- gerar o código ao criar um critério pela API;
- preservar e considerar os códigos existentes;
- impedir envio manual de código na criação;
- impedir alteração posterior de código e senso;
- adaptar o frontend para comunicar a geração automática;
- cobrir a regra com testes funcionais.

## Fora do escopo

- renumerar critérios existentes;
- alterar códigos preservados nos snapshots de supervisão;
- modificar perguntas, respostas, cálculo ou regras de não conformidade;
- gerar códigos para entidades diferentes de Critério de Verificação.

## Critérios de aceite

- cada senso gera códigos com seu prefixo e contador independentes;
- a numeração possui no mínimo três dígitos e continua acima de `999`;
- códigos existentes determinam o próximo número disponível;
- excluir um critério não permite reutilizar seu código;
- criação simultânea é serializada por senso no banco;
- código e senso não podem ser alterados pela API;
- formulário não solicita código na criação e exibe código e senso como
  somente leitura na edição;
- testes, lint e build passam.

## Resultado

- `FiveSSense` passou a fornecer o prefixo técnico de cada senso;
- serviço transacional gera o próximo código e cria o critério atomicamente;
- tabela `verification_criterion_code_sequences` mantém o último número por
  senso e foi inicializada pelos critérios e snapshots existentes;
- a API rejeita código manual na criação e alterações de código ou senso;
- o formulário comunica a geração automática e protege os campos imutáveis;
- códigos preexistentes e o seed demonstrativo foram preservados.

## Validações executadas

- migration aplicada no banco MySQL de desenvolvimento;
- cinco contadores conferidos com valor inicial `4`;
- `php artisan test --filter=VerificationCriterionTest` em MySQL — 7 testes e
  46 asserções;
- suíte completa em MySQL — 23 testes e 194 asserções;
- Laravel Pint nos arquivos PHP alterados;
- `composer validate --no-check-publish`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

## Decisões técnicas

- uma linha de sequência é bloqueada por senso durante a transação de criação;
- o próximo número considera o contador, critérios atuais e snapshots de
  supervisão para compatibilidade com dados existentes;
- a formatação usa no mínimo três dígitos, sem limitar números acima de `999`;
- números consumidos permanecem reservados mesmo após exclusão;
- factories e seeders podem informar códigos diretamente porque não passam
  pelo contrato público da API.

## Pendências residuais

Nenhuma pendência impede o aceite. O ambiente não possui a extensão SQLite;
por isso, os testes foram executados no banco MySQL isolado
`auditoria_5s_test`, conforme o fluxo já utilizado pelo projeto.
