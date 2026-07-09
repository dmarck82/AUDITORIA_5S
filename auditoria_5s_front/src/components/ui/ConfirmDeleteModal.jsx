function ConfirmDeleteModal({
  show,
  title = 'Confirmar exclusão',
  message = 'Deseja excluir este registro?',
  confirming = false,
  onCancel,
  onConfirm,
}) {
  if (!show) {
    return null
  }

  return (
    <div className="modal fade show d-block confirm-modal" role="dialog" aria-modal="true">
      <div className="modal-backdrop fade show" />
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5">{title}</h2>
            <button className="btn-close" type="button" aria-label="Fechar" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" type="button" disabled={confirming} onClick={onCancel}>Cancelar</button>
            <button className="btn btn-danger" type="button" disabled={confirming} onClick={onConfirm}>
              {confirming ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
