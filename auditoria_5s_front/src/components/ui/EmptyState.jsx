function EmptyState({ title = 'Nenhum registro encontrado.', description, icon = 'bi-inbox' }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <div>
        <p className="empty-state-title">{title}</p>
        {description && <p className="empty-state-description">{description}</p>}
      </div>
    </div>
  )
}

export default EmptyState
