function PageContainer({ children, className = '', fluid = false }) {
  return (
    <section className={`page-container ${fluid ? 'page-container-fluid' : ''} ${className}`.trim()}>
      {children}
    </section>
  )
}

export default PageContainer
