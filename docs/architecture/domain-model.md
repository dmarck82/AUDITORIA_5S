# Modelo de domínio do SSEP

## Objetivo

O SSEP supervisiona as condições dos ambientes de trabalho por meio da metodologia 5S.

## Estrutura organizacional

```text
Local 1 (rótulo padrão: Organização)
└── Local 2 (rótulo padrão: Setor/OMDS)
    └── Local 3 (rótulo padrão: Subsetor/Seção)
        └── Ambiente de Trabalho
```

Os nomes técnicos estáveis dos níveis são `Local1`, `Local2` e `Local3`. Os
rótulos exibidos podem ser alterados sem renomear o código.

## Usuários e acesso

### Usuário

Pessoa cadastrada no sistema e vinculada aos níveis organizacionais. O nome
técnico é `User` e a tabela é `users`.

### Operador

Conta autenticável vinculada a um Usuário. O nome técnico é `Operator`, a
tabela é `operators` e autenticação, permissões e auditoria usam essa entidade.

## Ambiente de Trabalho

Local supervisionável vinculado ao Local 3. O nome técnico aprovado é
`WorkEnvironment` e a tabela base é `work_environments`.

O CRUD foi implementado na tarefa R02. Cada ambiente possui nome, descrição
opcional, estado ativo e vínculo obrigatório com Local 3. O nome é único dentro
do mesmo Local 3. Cada Ambiente de Trabalho possui uma associação
muitos-para-muitos com os Critérios de Verificação aplicáveis. Processos e
Atividades não fazem mais parte do domínio.

## Metodologia e critérios

- o sistema utiliza exclusivamente a metodologia 5S;
- não há cadastro configurável de metodologias;
- Critérios de Verificação são perguntas padrão globais;
- cada critério pertence obrigatoriamente a um dos cinco sensos;
- a entidade técnica é `VerificationCriterion` e a tabela é
  `verification_criteria`;
- o código do critério é único e gerado automaticamente conforme o senso;
- os prefixos são `UTIL`, `ORD`, `LIMP`, `PAD` e `DISC`, com sequência
  independente e não reutilizável por senso;
- código e senso são imutáveis após a criação;
- o cadastro mantém pergunta, estado ativo e os demais campos configuráveis;
- cada critério possui quatro rótulos configuráveis associados aos valores
  fixos `0`, `5`, `10` e `15`; campos vazios usam o texto padrão;
- não há descrição, Modelo de Avaliação, Questionário ou entidade Pergunta
  separada;
- o CRUD do catálogo foi implementado na tarefa R03;
- a aplicabilidade do catálogo é definida por Ambiente de Trabalho na associação
  `work_environment_criteria`.

## Execução

A entidade técnica `Supervision` representa uma supervisão 5S de um Ambiente
de Trabalho, criada por um Operador e atribuída a um Usuário responsável. O
fluxo possui os estados `draft`, `pending`, `in_progress`, `answered` e
`finalized`, correspondentes a Rascunho, Pendente de resposta, Em
preenchimento, Respondida e Finalizada. As mudanças de estado são ações
explícitas; não existe seleção livre de status.

Ao criar a supervisão, são copiados snapshots do ambiente, Locais 1 a 3,
responsável inicial, operador criador, critérios ativos vinculados ao ambiente
e seus quatro rótulos. A exclusão ou alteração posterior dos cadastros não
modifica o histórico.

Administrador possui escopo global. Gerente e Operador visualizam as
supervisões do próprio escopo organizacional e podem respondê-las quando são o
responsável atual; o Gerente também cria no próprio escopo, finaliza e exclui
somente seus próprios rascunhos. Respondente visualiza e responde apenas o que
lhe foi atribuído. Visualizador não acessa Supervisões enquanto seu papel não
for definido. O vínculo a Local 2 sem Local 3 inclui todos os Locais 3
subordinados; com Local 3, o escopo fica restrito a ele.

Gerente e Operador podem assumir uma supervisão pendente ou em preenchimento
dentro do seu escopo. A justificativa é obrigatória, e o histórico preserva o
responsável anterior, o novo responsável, o operador que executou a ação e a
data e hora. O Respondente não assume supervisões de terceiros.

Cada `SupervisionAnswer` registra uma das notas fixas `0`, `5`, `10` ou `15`,
ou marca “Não aplicável” separadamente. Respostas não aplicáveis são excluídas
do cálculo. Todos os critérios têm peso igual e o percentual é:

```text
pontos obtidos / (15 × quantidade de critérios aplicáveis) × 100
```

Notas `0` e `5` indicam não conformidade e exigem observação. Nota `10` indica
oportunidade de melhoria. Evidência é opcional. A classificação de não
conformidade é derivada da resposta; não existe entidade separada nesta fase.
Após a finalização, a supervisão e suas respostas ficam imutáveis.

Um ambiente sem ao menos um critério ativo vinculado não pode iniciar uma nova
supervisão. Alterações nos vínculos afetam somente supervisões criadas depois
da mudança; os snapshots anteriores são preservados.

## Decisões atuais

- Local 1, Local 2 e Local 3 mantêm nomenclatura técnica estável.
- Ambiente de Trabalho substitui Processo.
- Atividade foi removida.
- 5S é a única metodologia.
- Usuário representa a pessoa cadastrada.
- Operador representa a conta de acesso.
- Critérios de Verificação são globais e classificados por um dos cinco sensos.
- A aplicabilidade dos critérios é configurada por Ambiente de Trabalho.
- Supervisões preservam snapshots, possuem transições explícitas e são
  imutáveis após finalização.
- O acesso às Supervisões respeita perfil, atribuição e hierarquia dos Locais
  2 e 3.
- A transferência de responsabilidade é auditável e exige justificativa.
- “Não aplicável” não participa do cálculo; todos os critérios têm peso igual.
- Não conformidades são derivadas das notas `0` e `5` nesta fase.

## Questões em aberto

- significado definitivo de OMDS;
- eventual fluxo próprio de não conformidade;
- supervisão de verificação e eficácia;
- regras definitivas do 5W2H.
