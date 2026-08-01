function LoadingOverlay({ message = 'Carregando...', inline = false }) {
  return (
    <div className={inline ? 'loading-inline' : 'loading-overlay'}>
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export default LoadingOverlay
