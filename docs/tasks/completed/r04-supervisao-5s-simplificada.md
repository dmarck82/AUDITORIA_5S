# R04 — Supervisão 5S simplificada

## Status

CONCLUÍDA em 2026-08-01.

## Objetivo

Implementar a supervisão usando Ambiente de Trabalho, Usuário e Critérios de
Verificação 5S.

## Pré-condições

- R01, R02 e R03 concluídas;
- regras de resposta aprovadas.

## Regras confirmadas — supervisão

- Usuário representa o responsável pelo Ambiente de Trabalho;
- “Não aplicável” é permitido, registrado separadamente e excluído do cálculo;
- todos os critérios possuem o mesmo peso;
- percentual = pontos obtidos ÷ máximo dos critérios aplicáveis × 100;
- respostas `0` e `5` caracterizam não conformidade;
- resposta `10` representa oportunidade de melhoria;
- observação é obrigatória para respostas `0` e `5`;
- evidência é opcional;
- o fluxo é `Rascunho → Finalizada`, sem aprovação adicional;
- após finalização, respostas e snapshots ficam imutáveis.

## Regra confirmada — opções de resposta

Cada Critério de Verificação terá quatro textos configuráveis, sempre associados
aos valores fixos `0`, `5`, `10` e `15`.

| Valor | Texto padrão |
|---:|---|
| 0 | Não atende ao requisito |
| 5 | Atende parcialmente, com falhas relevantes |
| 10 | Atende, com pequenas oportunidades de melhoria |
| 15 | Atende plenamente ao padrão estabelecido |

Regras de cadastro:

- os quatro campos serão apresentados já preenchidos com os textos padrão;
- o usuário poderá substituir qualquer texto;
- campo vazio será normalizado para o respectivo texto padrão no backend;
- os valores numéricos não serão configuráveis;
- a resposta registrada pela supervisão será sempre `0`, `5`, `10` ou `15`.

## Escopo da implementação

- ampliar Critérios de Verificação com quatro rótulos configuráveis;
- criar supervisões e respostas com snapshots históricos;
- implementar cálculo geral e por senso;
- implementar API, permissões e frontend;
- validar imutabilidade após finalização;
- indicar não conformidade de forma derivada das respostas `0` e `5`.

## Fora do escopo

- fluxo de aprovação adicional;
- plano de ação 5W2H;
- verificação de eficácia;
- entidade própria de não conformidade enquanto seu fluxo não for definido.

## Resultado

- os quatro rótulos configuráveis foram adicionados ao Critério de Verificação,
  com normalização no backend para os textos padrão;
- supervisões em rascunho e finalizadas foram implementadas com snapshots do
  ambiente, hierarquia organizacional, responsável, operador, critérios e
  opções de resposta;
- respostas aceitam exclusivamente `0`, `5`, `10`, `15` ou “Não aplicável”;
- cálculo geral e por senso desconsidera respostas não aplicáveis;
- respostas `0` e `5` indicam não conformidade e exigem observação;
- API, permissões e frontend foram implementados;
- supervisões finalizadas são imutáveis.

Não foi criada uma entidade de não conformidade: nesta fase, a indicação é
derivada da resposta, evitando duplicação antes da definição de seu fluxo.

## Validações executadas

- suíte completa: 15 testes e 121 asserções;
- testes específicos da supervisão: 5 testes e 62 asserções;
- reconstrução do banco MySQL de teste com migrations e seed;
- migrations aplicadas no banco de desenvolvimento;
- Laravel Pint;
- rotas da supervisão inspecionadas;
- lint e build de produção do frontend.

## Pendências residuais

- fluxo de plano de ação 5W2H, verificação e eficácia continua fora do escopo;
- o significado definitivo de OMDS permanece sem definição;
- os documentos antigos ainda presentes em `pending` não são elegíveis para
  ativação, pois descrevem o domínio substituído pela simplificação da R01.
