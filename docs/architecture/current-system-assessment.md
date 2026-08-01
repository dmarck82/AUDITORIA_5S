# Avaliacao do sistema atual do SSEP

## 1. Resumo da arquitetura

O repositorio esta organizado em duas aplicacoes:

- `auditoria_5s_api`: API Laravel com PHP 8.3, Laravel 13, Sanctum e `tymon/jwt-auth`.
- `auditoria_5s_front`: frontend React 19 com Vite, Bootstrap 5, axios e React Router.

O backend expoe uma API REST em `routes/api.php`. A autenticacao administrativa usa JWT no guard `auth:api`; as rotas protegidas aplicam o middleware `permission:{permissao}`. O controle de permissoes fica centralizado em `App\Support\AccessPermissions`, com niveis em `App\Enums\AccessLevel`.

Os modulos atuais seguem o padrao:

- migration;
- model Eloquent com relacionamentos explicitos;
- Form Request;
- API Resource;
- controller REST pequeno;
- rotas individuais;
- factories para parte das entidades.

Nao foram encontrados diretorios ou classes de policies, services ou actions. Regras de validacao e consistencia ficam hoje nos Form Requests, controllers e models.

O frontend usa rotas protegidas por permissao, componentes reutilizaveis de layout/tabela/modal e paginas separadas para listagem, formulario e visualizacao. O consumo da API e feito por uma instancia unica de axios em `src/api/axios.js`.

## 2. Estrutura atual do banco

### Organizacional e pessoas

Tabela `organizations`:

- `id`;
- `name`;
- `active`;
- timestamps.

Tabela `units`:

- `id`;
- `organization_id` com FK para `organizations` e `restrictOnDelete`;
- `name`;
- `address`;
- `active`;
- timestamps.

Tabela `sectors`:

- `id`;
- `unit_id` com FK para `units` e `restrictOnDelete`;
- `name`;
- `description`;
- `active`;
- timestamps.

Tabela `people`:

- `id`;
- `name`;
- `email` unico e nullable;
- `phone` unico e nullable;
- `organization_id`, `unit_id`, `sector_id` com FKs posteriores e `nullOnDelete`;
- `job_title`;
- `photo_path`;
- `active`;
- timestamps.

Tabela `users`:

- `id`;
- `person_id` unico com FK para `people` e `cascadeOnDelete`;
- `password`;
- `access_level`;
- `active`;
- remember token;
- timestamps.

Tabela `organization_labels`:

- `id`;
- `organization_id` nullable com FK para `organizations` e `cascadeOnDelete`;
- `entity`;
- `label`;
- timestamps;
- unicidade em `organization_id + entity`.

### Tabelas genericas

Tabela `generic_tables`:

- `id`;
- `code` unico;
- `name`;
- `description`;
- `active`;
- timestamps.

Tabela `generic_table_items`:

- `id`;
- `generic_table_id` com FK e `cascadeOnDelete`;
- `code`;
- `name`;
- `description`;
- `sort_order`;
- `active`;
- timestamps;
- unicidade em `generic_table_id + code`;
- indice em `generic_table_id + sort_order`.

Seeders atuais:

- `ASSESSMENT_STATUS`: `DRAFT`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`;
- `ANSWER_SCALE`: cinco opcoes de 1 a 5 no frontend/validacao publica;
- `QUESTION_CATEGORY`: `SORT`, `SET_IN_ORDER`, `SHINE`, `STANDARDIZE`, `SUSTAIN`;
- `PERSON_STATUS`;
- `USER_STATUS`.

### Questionarios, perguntas, avaliacoes e evidencias

Tabela `questionnaires`:

- `id`;
- `name`;
- `description`;
- `active`;
- timestamps;
- `updated_by` nullable com FK para `users`.

Tabela `questions`:

- `id`;
- `questionnaire_id` com FK para `questionnaires`, `cascadeOnUpdate` e `restrictOnDelete`;
- `category`;
- `question`;
- `description`;
- `sort_order`;
- `active`;
- timestamps;
- `updated_by` nullable com FK para `users`;
- indices em `questionnaire_id + sort_order` e `category`.

Tabela `assessments`:

- `id`;
- `questionnaire_id` com FK para `questionnaires` e `restrictOnDelete`;
- `organization_id` com FK para `organizations` e `restrictOnDelete`;
- `unit_id` nullable com FK para `units` e `nullOnDelete`;
- `sector_id` nullable com FK para `sectors` e `nullOnDelete`;
- `person_id` com FK para `people` e `restrictOnDelete`;
- `title`;
- `status`;
- `access_code` unico;
- `expires_at`;
- `answered_at`;
- `active`;
- `created_by`, `updated_by` nullable com FK para `users` e `nullOnDelete`;
- timestamps;
- indices em `organization_id + status`, `person_id + status`, `questionnaire_id + status`.

Tabela `assessment_answers`:

- `id`;
- `assessment_id` com FK para `assessments` e `cascadeOnDelete`;
- `question_id` com FK para `questions` e `restrictOnDelete`;
- `person_id` com FK para `people` e `restrictOnDelete`;
- `score`;
- `observation`;
- timestamps;
- unicidade em `assessment_id + question_id`;
- indice em `person_id + assessment_id`.

Tabela `evidences`:

- `id`;
- `assessment_answer_id` com FK para `assessment_answers` e `cascadeOnDelete`;
- `file_path`;
- `original_name`;
- `mime_type`;
- `file_size`;
- timestamps;
- indice em `assessment_answer_id`.

### Infraestrutura Laravel

Tambem existem tabelas padrao de cache, jobs, failed jobs, sessions, password reset tokens e personal access tokens.

## 3. API atual

### Publico

- `GET /api/hello`;
- `POST /api/auth/login`;
- `GET /api/public/assessments/{accessCode}`;
- `POST /api/public/assessments/{accessCode}/answers`;
- `POST /api/public/assessments/{accessCode}/complete`;
- `GET /api/public/assessments/{accessCode}/answers/{answer}/evidences/{evidence}/file`;
- `POST /api/public/assessments/{accessCode}/answers/{answer}/evidences`;
- `DELETE /api/public/assessments/{accessCode}/answers/{answer}/evidences/{evidence}`.

O fluxo publico localiza uma avaliacao por `access_code`, valida disponibilidade por `status`, `active` e `expires_at`, permite salvar respostas por pergunta e conclui somente quando todas as perguntas ativas do questionario possuem resposta.

### Administrativo autenticado

Rotas protegidas por `auth:api`:

- autenticacao: `GET /auth/me`, `POST /auth/logout`;
- organizacoes: listagem, criacao, exibicao, atualizacao e exclusao;
- unidades: listagem, criacao, exibicao, atualizacao e exclusao;
- setores: listagem, criacao, exibicao, atualizacao e exclusao;
- pessoas: listagem, criacao, exibicao, foto, atualizacao e exclusao;
- usuarios: listagem, criacao, exibicao, atualizacao e exclusao;
- questionarios: listagem, criacao, exibicao, atualizacao e exclusao;
- perguntas: categorias, listagem, criacao, reordenacao, exibicao, atualizacao e exclusao;
- avaliacoes: status, listagem, criacao, exibicao, atualizacao e exclusao.

As permissoes seguem strings como `organizations.view`, `questions.update` e `assessments.create`. O administrador recebe todas as permissoes cadastradas; demais niveis recebem subconjuntos.

Validacoes relevantes:

- organizacao, unidade, setor, pessoa, usuario, questionario, pergunta e avaliacao usam Form Requests;
- pessoa exige `organization_id`;
- unidade deve pertencer a organizacao;
- setor deve pertencer a unidade;
- avaliacao valida status em `generic_table_items`, questionario ativo, organizacao ativa, pessoa ativa e compatibilidade entre organizacao, unidade e setor;
- nao e permitido alterar o questionario de uma avaliacao apos sair de `DRAFT`;
- avaliacao `COMPLETED` nao pode ser excluida;
- resposta publica aceita `score` entre 1 e 5;
- evidencia publica aceita uma imagem por requisicao, tipos `jpg`, `jpeg`, `png`, `webp`, ate 5120 KB.

## 4. Frontend atual

O frontend possui:

- login;
- resposta publica por codigo de acesso;
- layout autenticado;
- menu por permissao;
- CRUD de organizacoes;
- CRUD de unidades;
- CRUD de setores;
- CRUD de pessoas;
- CRUD de usuarios;
- CRUD de questionarios;
- CRUD de perguntas, com filtro por questionario e reordenacao;
- CRUD de avaliacoes;
- upload/remocao de evidencias no fluxo publico.

Componentes reutilizaveis observados:

- `DataTable`;
- `Loading`;
- `AlertMessage`;
- `Layout`;
- `TableActions`;
- `ConfirmDeleteModal`;
- componentes de UI como `PageContainer`, `PageHeader`, `FormSection`, `FormActions`, `StatusBadge`, `EmptyState`, `LoadingOverlay`.

O cliente usa `fetchAllPages` para consumir endpoints paginados e carregar todas as paginas em memoria antes de filtrar, ordenar ou renderizar.

Menus desabilitados indicam funcionalidades planejadas, mas nao implementadas:

- Dashboard 5S;
- Indicadores;
- Ranking de Setores;
- Nao Conformidades;
- Meu Perfil;
- Configuracoes;
- Labels da Organizacao;
- Tabelas Genericas;
- Logs do Sistema.

## 5. Matriz de reaproveitamento

| Conceito | Implementacao atual | Pode reaproveitar? | Alteracao necessaria |
| --- | --- | --- | --- |
| Organizacao | `organizations`, model, controller, requests, resources, telas | Sim | Manter como raiz organizacional. Avaliar unicidade de nome apenas se virar requisito. |
| Unidade | `units` ligada a `organizations` | Sim | Pode representar Unidade/OMDS tecnicamente, mas OMDS precisa de definicao de negocio. |
| OMDS | Nao ha entidade propria | Parcial | Usar `organization_labels` ou label de UI pode ser reversivel; entidade propria depende de definicao. |
| Setor | `sectors` ligada a `units` | Sim | Candidato natural para vincular processos na primeira etapa. |
| Subsetor | Nao ha entidade propria | Nao ainda | Nao implementar ate validar necessidade e relacionamento com setor. |
| Processo | Nao existe | Nao | Criar em fase propria, preferencialmente vinculado a `sector_id` enquanto subsetor nao existir. |
| Atividade | Nao existe | Nao | Criar em fase propria ligada a processo, com ordem e status. |
| Metodologia | Nao existe | Nao | Criar biblioteca metodologica separada. Nao reaproveitar questionario como metodologia. |
| Dimensao ou senso | `questions.category` e tabela generica `QUESTION_CATEGORY` representam sensos de perguntas atuais | Parcial | Para o novo dominio, criar `dimensoes_avaliacao`; migracao conceitual dos sensos deve ser planejada. |
| Criterio | `questions.question` funciona como pergunta atual | Parcial | Nao equivale a criterio universal; criar `criterios` para biblioteca metodologica. |
| Modelo de avaliacao | `ANSWER_SCALE` e score 1..5 atuais | Parcial | Nao representa modelos M01/M02; criar `modelos_avaliacao` e opcoes quando a fase 2 iniciar. |
| Opcao | `generic_table_items` para status, escala e categorias | Parcial | Pode inspirar padrao de codigo/ordem/status, mas opcoes metodologicas precisam de tabela propria para relacionar modelo e snapshots. |
| Checklist | `questionnaires` | Sim, com cautela | Pode ser legado/equivalente de checklist atual; nao usar como metodologia sem migracao. |
| Pergunta | `questions` | Sim, como legado | Pode alimentar compatibilidade do fluxo atual, mas nao substitui criterio/aspecto. |
| Alternativa | Nao ha alternativas por pergunta; ha escala fixa 1..5 | Parcial | Criar alternativas/opcoes apenas na biblioteca metodologica, sem afetar fluxo atual. |
| Auditoria ou supervisao | `assessments` | Parcial | Reaproveitar como avaliacao legada; supervisao SSEP futura precisa snapshots e decisao de abrangencia. |
| Resposta | `assessment_answers` por avaliacao + pergunta | Parcial | Reaproveitavel no legado; nova execucao precisa decidir resposta por criterio ou aspecto. |
| Evidencia | `evidences` ligada a resposta | Sim | Boa base tecnica; avaliar associacao futura a resposta/snapshot. |
| Nao conformidade | Nao existe; menu indica item futuro | Nao | Nao implementar ate definir regra de geracao, validacao e criticidade. |
| Plano de acao | Nao existe | Nao | Nao implementar ate definir regras de 5W2H, aprovacao, verificacao e eficacia. |
| Perfis/permissoes | `access_level` e `AccessPermissions` | Sim | Adicionar permissoes novas seguindo matriz atual. |
| Tabelas genericas | `generic_tables` e `generic_table_items` | Sim, com cautela | Usar para dominios simples; evitar para entidades metodologicas relacionais. |

## 6. Conflitos e inconsistencias

- O dominio atual usa `assessments`, `questionnaires` e `questions`; os documentos SSEP falam em supervisao, metodologia, dimensao, criterio, aspecto e modelo de avaliacao.
- `questions.category` representa sensos 5S no sistema atual, mas o modelo SSEP define senso como dimensao de uma metodologia.
- `ANSWER_SCALE` e a validacao publica `score` 1..5 nao correspondem ao exemplo M02 com valores 0, 5, 10 e 15.
- Nao ha snapshots de criterios, aspectos, opcoes ou modelo no fluxo atual; respostas apontam para perguntas mutaveis.
- Avaliacoes concluidas preservam respostas, mas nao preservam texto congelado da pergunta nem configuracao da escala.
- O menu possui entradas futuras para nao conformidades e indicadores, mas nao ha schema nem regras para essas areas.
- `organization_labels` existe no banco e no model, mas nao ha CRUD exposto no frontend/API administrativa.
- `generic_tables` existe no banco e e usado por seeders/controllers, mas nao ha CRUD administrativo.
- Pessoas possuem `organization_id`, `unit_id` e `sector_id`; avaliacoes tambem possuem esses campos. Isso e util para filtro, mas exige cuidado para evitar divergencia entre pessoa e escopo da avaliacao.
- Nao ha `subsetor`; implementar processos diretamente em setor e reversivel, mas deve ser documentado como decisao tecnica provisoria.

## 7. Riscos

- Risco de duplicacao conceitual se `questionnaires/questions` forem expandidos para tentar representar metodologia, criterio e aspecto.
- Risco historico: alterar perguntas, categorias ou escala pode afetar a interpretacao de avaliacoes antigas, pois nao ha snapshots completos.
- Risco de migration se novas tabelas forem adicionadas sem estrategia para compatibilidade com avaliacoes existentes.
- Risco de autorizacao: novas rotas exigirao novas permissoes em `AccessPermissions` e no frontend.
- Risco de cobertura: os testes existentes sao apenas exemplos e nao cobrem CRUD, permissoes, validacoes, fluxo publico, evidencias ou migrations.
- Risco de performance no frontend: `fetchAllPages` carrega todas as paginas em memoria, aceitavel para cadastros pequenos, mas sensivel a crescimento.
- Risco de nomenclatura: "avaliacao", "auditoria" e "supervisao" ainda nao estao consolidados.
- Risco de status: status de avaliacao vem de tabela generica, mas regras de transicao estao espalhadas entre controller/request.
- Risco de remocao: algumas FKs usam `restrictOnDelete`, outras `nullOnDelete` e outras `cascadeOnDelete`; novas entidades precisam definir comportamento explicitamente para preservar historico.
- Risco de dados derivados: associacoes futuras entre atividade e criterio nao devem repetir dimensao/senso.

## 8. Duvidas de negocio

- OMDS e uma unidade, um tipo de unidade, uma entidade paralela ou apenas um rotulo organizacional?
- O processo deve pertencer a setor ou a subsetor?
- Subsetor sera necessario na primeira fase ou pode ficar fora do escopo inicial?
- "Auditoria", "avaliacao" e "supervisao" serao sinonimos no produto ou entidades/fluxos diferentes?
- Uma supervisao avaliara uma atividade, varias atividades, um setor inteiro ou outro escopo?
- A resposta futura sera por criterio, por aspecto ou por ambos?
- Havera opcao "nao aplicavel"?
- Observacao e evidencia serao obrigatorias em quais casos?
- Quais notas geram nao conformidade?
- A nao conformidade sera automatica, validada ou manual?
- Havera pesos por criterio, dimensao, atividade ou metodologia?
- Como serao calculados resultados por atividade, dimensao e geral?
- Quais sao as regras definitivas do 5W2H?
- Como sera preservado o historico de mudancas metodologicas em supervisoes concluidas?

## 9. Plano incremental

1. Concluir e revisar este relatorio de inspecao.
2. Implementar estrutura operacional minima: processos e atividades.
3. Vincular processo inicialmente a `sector_id`, registrando que subsetor/OMDS permanecem pendentes.
4. Criar CRUD administrativo backend e frontend para processos e atividades, seguindo os padroes existentes.
5. Adicionar permissoes `processes.*` e `activities.*` em `AccessPermissions` e rotas protegidas no frontend.
6. Adicionar testes de feature para CRUD, validacao e relacoes.
7. Depois disso, iniciar biblioteca metodologica em tabelas proprias: metodologias, dimensoes, modelos, opcoes e criterios.
8. Implementar associacao atividade-criterio e aspectos somente depois da biblioteca metodologica.
9. Adiar execucao/supervisao nova ate definir abrangencia, snapshots e regra de resposta.

## 10. Primeira tarefa recomendada

A primeira tarefa recomendada e a Fase 1 em escopo reduzido:

- criar `processes` vinculada a `sectors`;
- criar `activities` vinculada a `processes`;
- incluir `name`, `description`, `sort_order` quando aplicavel, `active` e timestamps;
- aplicar FKs, indices e unicidade coerente;
- adicionar models, factories, Form Requests, Resources, controllers e rotas;
- adicionar permissoes no backend e rotas/telas no frontend;
- cobrir CRUD e validacoes com testes de feature.

Decisao tecnica reversivel proposta: enquanto `subsetor` e OMDS nao forem definidos, processo deve pertencer a setor. Essa escolha reaproveita a estrutura existente, nao exige migrar dados antigos e pode ser evoluida depois com uma migration controlada caso `subsetor` seja confirmado.
