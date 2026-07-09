import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
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
      render: (organization) => <StatusBadge status={organization.active ? 'active' : 'inactive'}>{organization.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (organization) => (organization.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (organization) => (organization.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (organization) => (
        <TableActions actions={[
          { label: 'Ver', to: `/organizations/${organization.id}`, type: 'view' },
          can('organizations.update') && { label: 'Editar', to: `/organizations/${organization.id}/edit`, type: 'edit' },
          can('organizations.delete') && { label: 'Excluir', onClick: () => deleteOrganization(organization), type: 'delete' },
        ]} />
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Organizações"
        description="Gerencie empresas cadastradas."
        actions={can('organizations.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/organizations/create">Nova Organização</Link>
          </PageActions>
        )}
      />

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
