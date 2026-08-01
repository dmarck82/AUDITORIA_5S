function PageHeader({ title, description, actions, breadcrumb }) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        {breadcrumb}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export default PageHeader
