export const ASSESSMENT_STATUS_LABELS = {
  DRAFT: 'Rascunho',
  AVAILABLE: 'Disponível',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

export function getAssessmentStatusLabel(status) {
  return ASSESSMENT_STATUS_LABELS[status] || status || '-'
}

export function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)

  return offsetDate.toISOString().slice(0, 16)
}
