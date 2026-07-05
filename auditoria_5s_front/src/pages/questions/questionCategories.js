export const QUESTION_CATEGORY_LABELS = {
  SORT: 'Senso de Utilização',
  SET_IN_ORDER: 'Senso de Organização',
  SHINE: 'Senso de Limpeza',
  STANDARDIZE: 'Senso de Padronização',
  SUSTAIN: 'Senso de Disciplina',
}

export function getQuestionCategoryLabel(category) {
  return QUESTION_CATEGORY_LABELS[category] || category || '-'
}
