import Card from './Card'

function FormSection({ title, description, children, className = '' }) {
  return (
    <Card className={`form-section ${className}`.trim()}>
      {(title || description) && (
        <div className="form-section-heading">
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </Card>
  )
}

export default FormSection
