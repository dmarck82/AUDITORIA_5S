import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
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
      <PageHeader
        title="Detalhes da Organização"
        description="Informações da organização."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/organizations">Voltar</Link>
          {organization && can('organizations.update') && <Link className="btn btn-primary" to={`/organizations/${organization.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {organization && (
        <Card><dl className="row mb-0">
          <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{organization.name || '-'}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={organization.active ? 'active' : 'inactive'}>{organization.active ? 'Sim' : 'Não'}</StatusBadge></dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(organization.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(organization.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{organization.updated_by_name || '-'}</dd>
        </dl></Card>
      )}
    </section>
  )
}

export default OrganizationsView
