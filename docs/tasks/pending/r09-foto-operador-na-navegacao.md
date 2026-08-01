# R09 — Foto do operador autenticado na navegação

## Status

PENDENTE. Esta tarefa ainda não foi iniciada e não deve ser implementada antes
de ser movida manualmente de `pending` para `active`.

## Contexto confirmado

O frontend apresenta atualmente a inicial do nome do operador autenticado no
canto superior direito da barra de navegação.

A foto do Usuário já é armazenada de forma privada e pode ser consultada pela
rota `/api/users/{user}/photo`. Essa rota exige `users.view`, portanto não é
adequada para exibir a própria foto em perfis que não possuem acesso ao cadastro
de Usuários.

O recurso autenticado retornado por login e `/api/auth/me` informa somente o
identificador do Operador, nome e nível de acesso. Ele não informa atualmente a
existência da foto do Usuário vinculado.

## Objetivo

Exibir na barra de navegação a foto do Usuário vinculado ao Operador autenticado,
mantendo a inicial do nome como fallback seguro quando não existir foto ou o
carregamento falhar.

## Escopo

### Backend

- expor no recurso do Operador autenticado se o Usuário vinculado possui foto;
- carregar somente os campos necessários do Usuário durante login e
  `/api/auth/me`;
- criar uma rota autenticada específica para consultar a própria foto, sem
  depender da permissão `users.view`;
- resolver o Usuário exclusivamente a partir do Operador autenticado;
- reutilizar o armazenamento privado e as verificações de existência já
  aplicadas às fotos de Usuários;
- retornar resposta adequada quando o operador não possuir Usuário, foto ou
  arquivo válido;
- cobrir o contrato e a autorização com testes funcionais.

### Frontend

- carregar a foto autenticada como `blob` por meio da instância Axios existente;
- gerar uma URL temporária com `URL.createObjectURL`;
- revogar a URL temporária ao substituir a imagem ou desmontar o componente;
- exibir a foto recortada em formato circular no lugar da inicial;
- manter a inicial do nome durante o carregamento, quando não houver foto ou
  quando a requisição falhar;
- preservar nome, nível de acesso, botão de saída e comportamento responsivo da
  barra de navegação;
- validar lint e build.

## Regras de segurança

- a rota da própria foto deve exigir autenticação JWT;
- nenhum identificador de Usuário deve ser aceito como parâmetro nessa rota;
- a rota não pode permitir consultar a foto de outro Usuário;
- a foto deve permanecer no disco privado;
- não criar URL pública permanente nem incluir o conteúdo da foto no token ou no
  `localStorage`;
- o frontend deve continuar enviando o token pelo interceptor Axios existente.

## Fora do escopo

- alterar upload, substituição ou exclusão de fotos no cadastro de Usuários;
- criar página de perfil do operador;
- permitir consulta pública de fotos;
- alterar permissões de `users.view`;
- modificar tabelas, migrations ou armazenamento de arquivos;
- exibir fotos em listagens ou módulos diferentes da barra de navegação.

## Critérios de aceite

- operador com foto visualiza sua própria imagem na barra de navegação;
- operador sem foto continua visualizando a inicial do nome;
- falha ou arquivo inexistente não quebra a navegação e usa a inicial como
  fallback;
- perfis sem `users.view` conseguem consultar somente a própria foto;
- requisição sem autenticação é recusada;
- não é possível usar a nova rota para consultar a foto de terceiros;
- a imagem mantém proporção, recorte circular e comportamento responsivo;
- URLs temporárias do navegador são revogadas corretamente;
- testes funcionais do backend passam;
- Laravel Pint, `composer validate`, `npm run lint`, `npm run build` e
  `git diff --check` passam.

## Banco de dados

Nenhuma alteração prevista.

## Dependências

- vínculo existente `Operator → User`;
- armazenamento privado de fotos já implementado;
- autenticação JWT e interceptor Axios atuais.

## Encerramento

Ao terminar, execute:

```text
docs/tasks/templates/00-encerrar-tarefa.md
```

## Prompt para o Codex CLI

```text
Leia AGENTS.md, docs/architecture e a única tarefa em docs/tasks/active.
Execute somente a tarefa ativa.
Apresente um plano curto antes de alterar código.
Não implemente itens fora do escopo.
Execute testes, lint e build aplicáveis.
Ao final, execute docs/tasks/templates/00-encerrar-tarefa.md.
Não faça commit.
```
