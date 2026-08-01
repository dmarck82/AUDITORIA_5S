const STATUS_VARIANTS = {
  draft: 'secondary',
  pending: 'primary',
  in_progress: 'warning',
  answered: 'info',
  finalized: 'success',
}

export function getSupervisionStatusVariant(status) {
  return STATUS_VARIANTS[status] || 'secondary'
}
