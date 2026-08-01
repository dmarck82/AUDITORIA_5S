const variantByStatus = {
  active: 'success',
  inactive: 'secondary',
  yes: 'success',
  no: 'secondary',
  DRAFT: 'secondary',
  AVAILABLE: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

function StatusBadge({ children, status, variant }) {
  const resolvedVariant = variant || variantByStatus[status] || 'secondary'

  return (
    <span className={`status-badge badge text-bg-${resolvedVariant}`}>
      {children}
    </span>
  )
}

export default StatusBadge
