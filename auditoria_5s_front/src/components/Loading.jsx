function Loading({ message = 'Carregando...' }) {
  return (
    <div className="d-flex align-items-center gap-2 py-4">
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export default Loading
