import { Link } from "react-router-dom"
import { useAuth } from "../../auth/useAuth"
import { EmptyState, PageHeader } from "../../components/ui"
import { registrationItems } from "../../constants/registrations"

function Registrations() {
  const { can } = useAuth()
  const visibleItems = registrationItems.filter((item) => can(item.permission))

  return (
    <section>
      <PageHeader
        title="Cadastros"
        description="Acesse e gerencie os dados que estruturam as supervisões 5S."
      />

      {visibleItems.length > 0 ? (
        <div className="registration-grid">
          {visibleItems.map((item) => (
            <Link className="registration-link" key={item.path} to={item.path}>
              <span className="registration-icon" aria-hidden="true">
                <i className={`bi ${item.icon}`} />
              </span>
              <span className="registration-copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <i className="bi bi-arrow-right registration-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="app-card card">
          <div className="card-body">
            <EmptyState description="Seu perfil não possui acesso aos módulos desta área." icon="bi-shield-lock" title="Nenhum cadastro disponível" />
          </div>
        </div>
      )}
    </section>
  )
}

export default Registrations
