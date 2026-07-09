function Card({ children, className = '', bodyClassName = '', header, footer }) {
  return (
    <div className={`app-card card ${className}`.trim()}>
      {header && <div className="app-card-header card-header">{header}</div>}
      <div className={`app-card-body card-body ${bodyClassName}`.trim()}>{children}</div>
      {footer && <div className="app-card-footer card-footer">{footer}</div>}
    </div>
  )
}

export default Card
