function FormActions({ children, align = 'start' }) {
  const justifyClass = align === 'end' ? 'justify-content-end' : 'justify-content-start'

  return (
    <div className={`form-actions ${justifyClass}`}>
      {children}
    </div>
  )
}

export default FormActions
