import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { fetchAllPages } from '../../utils/apiData'
import { useAuth } from '../../auth/useAuth'

function OrganizationsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadOrganizations = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setOrganizations(await fetchAllPages('/organizations'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as organizações.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadOrganizations()
  }, [loadOrganizations])

  const deleteOrganization = async (organization) => {
    if (!window.confirm(`Deseja excluir ${organization.name || 'esta organização'}?`)) {
      return
    }

    try {
      await api.delete(`/organizations/${organization.id}`)
      setAlert({ type: 'success', message: 'Organização excluída com sucesso.' })
      setOrganizations((currentOrganizations) => currentOrganizations.filter((item) => item.id !== organization.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir a organização.' })
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (organization) => organization.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (organization) => <span className={`badge text-bg-${organization.active ? 'success' : 'secondary'}`}>{organization.active ? 'Sim' : 'Não'}</span>,
      searchValue: (organization) => (organization.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (organization) => (organization.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (organization) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/organizations/${organization.id}`}>Ver</Link>
          {can('organizations.update') && <Link className="btn btn-outline-primary" to={`/organizations/${organization.id}/edit`}>Editar</Link>}
          {can('organizations.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteOrganization(organization)}>Excluir</button>}
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Organizações</h1>
          <p className="text-secondary mb-0">Gerencie empresas cadastradas.</p>
        </div>
        {can('organizations.create') && <Link className="btn btn-primary" to="/organizations/create">
          Nova Organização
        </Link>}
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando organizações..." />
      ) : (
        <DataTable columns={columns} rows={organizations} emptyMessage="Nenhuma organização encontrada." />
      )}
    </section>
  )
}

export default OrganizationsList
