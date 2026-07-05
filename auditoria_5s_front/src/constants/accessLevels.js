export const ACCESS_LEVEL = {
  VIEWER: 1,
  RESPONDENT: 2,
  OPERATOR: 3,
  MANAGER: 4,
  ADMINISTRATOR: 5,
}

export const ACCESS_LEVEL_OPTIONS = [
  { value: ACCESS_LEVEL.VIEWER, label: 'Visualizador' },
  { value: ACCESS_LEVEL.RESPONDENT, label: 'Respondente' },
  { value: ACCESS_LEVEL.OPERATOR, label: 'Operador' },
  { value: ACCESS_LEVEL.MANAGER, label: 'Gerente' },
  { value: ACCESS_LEVEL.ADMINISTRATOR, label: 'Administrador' },
]

export function getAccessLevelLabel(accessLevel) {
  return ACCESS_LEVEL_OPTIONS.find((option) => option.value === Number(accessLevel))?.label || '-'
}
