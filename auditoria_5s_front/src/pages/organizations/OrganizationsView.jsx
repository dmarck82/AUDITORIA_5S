import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/formatters'

function OrganizationsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const response = await api.get(`/organizations/${id}`)
        setOrganization(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a organização.' })
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [id])

  if (loading) {
    return <Loading message="Carregando organização..." />
  }

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes da Organização</h1>
          <p className="text-secondary mb-0">Informações da organização.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/organizations">Voltar</Link>
          {organization && can('organizations.update') && <Link className="btn btn-primary" to={`/organizations/${organization.id}/edit`}>Editar</Link>}
        </div>
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {organization && (
        <div className="card"><div className="card-body"><dl className="row mb-0">
          <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{organization.name || '-'}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9">{organization.active ? 'Sim' : 'Não'}</dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(organization.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(organization.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{organization.updated_by_name || '-'}</dd>
        </dl></div></div>
      )}
    </section>
  )
}

export default OrganizationsView
