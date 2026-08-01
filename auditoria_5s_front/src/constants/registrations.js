export const registrationItems = [
  { description: "Estrutura organizacional de primeiro nível.", icon: "bi-building", label: "Organização", path: "/local1s", permission: "local1s.view" },
  { description: "Setores e unidades vinculados à organização.", icon: "bi-diagram-3", label: "Setor/OMDS", path: "/local2s", permission: "local2s.view" },
  { description: "Subsetores e seções que detalham cada setor.", icon: "bi-signpost-split", label: "Subsetor/Seção", path: "/local3s", permission: "local3s.view" },
  { description: "Locais onde as supervisões 5S são realizadas.", icon: "bi-geo-alt", label: "Ambiente de Trabalho", path: "/work-environments", permission: "work_environments.view" },
  { description: "Perguntas e parâmetros utilizados nas verificações.", icon: "bi-ui-checks-grid", label: "Critérios de Verificação", path: "/verification-criteria", permission: "verification_criteria.view" },
  { description: "Pessoas vinculadas à estrutura organizacional.", icon: "bi-people", label: "Usuários", path: "/users", permission: "users.view" },
  { description: "Contas de acesso, perfis e permissões do sistema.", icon: "bi-person-badge", label: "Operadores", path: "/operators", permission: "operators.view" },
]
