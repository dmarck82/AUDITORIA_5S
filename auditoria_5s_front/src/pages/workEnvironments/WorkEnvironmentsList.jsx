import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'

function WorkEnvironmentsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [workEnvironments, setWorkEnvironments] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadWorkEnvironments = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) setAlert(null)

    try {
      setWorkEnvironments(await fetchAllPages('/work-environments'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os ambientes de trabalho.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => { loadWorkEnvironments() }, [loadWorkEnvironments])

  const deleteWorkEnvironment = async (workEnvironment) => {
    if (!window.confirm(`Deseja excluir ${workEnvironment.name || 'este ambiente de trabalho'}?`)) return

    try {
      await api.delete(`/work-environments/${workEnvironment.id}`)
      setAlert({ type: 'success', message: 'Ambiente de Trabalho excluído com sucesso.' })
      setWorkEnvironments((current) => current.filter((item) => item.id !== workEnvironment.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir o ambiente de trabalho.' })
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (workEnvironment) => workEnvironment.name || '-' },
    {
      key: 'local3',
      label: 'Subsetor/Seção',
      render: (workEnvironment) => getRelatedName(workEnvironment, 'local3', 'local_3_id'),
      searchValue: (workEnvironment) => getRelatedName(workEnvironment, 'local3', 'local_3_id'),
      sortValue: (workEnvironment) => getRelatedName(workEnvironment, 'local3', 'local_3_id'),
    },
    {
      key: 'local2',
      label: 'Setor/OMDS',
      render: (workEnvironment) => workEnvironment.local3?.local2?.name || '-',
      searchValue: (workEnvironment) => workEnvironment.local3?.local2?.name || '',
      sortValue: (workEnvironment) => workEnvironment.local3?.local2?.name || '',
    },
    {
      key: 'criteria',
      label: 'Critérios',
      render: (workEnvironment) => (workEnvironment.active_verification_criteria_count ?? 0) + ' ativos / ' + (workEnvironment.verification_criteria_count ?? 0),
      sortValue: (workEnvironment) => workEnvironment.active_verification_criteria_count ?? 0,
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (workEnvironment) => <StatusBadge status={workEnvironment.active ? 'active' : 'inactive'}>{workEnvironment.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (workEnvironment) => (workEnvironment.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (workEnvironment) => (workEnvironment.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (workEnvironment) => <TableActions actions={[
        { label: 'Ver', to: `/work-environments/${workEnvironment.id}`, type: 'view' },
        { label: 'Critérios de Verificação', to: `/work-environments/${workEnvironment.id}/criteria`, icon: 'bi-ui-checks-grid', variant: 'outline-success' },
        can('work_environments.update') && { label: 'Editar', to: `/work-environments/${workEnvironment.id}/edit`, type: 'edit' },
        can('work_environments.delete') && { label: 'Excluir', onClick: () => deleteWorkEnvironment(workEnvironment), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Ambiente de Trabalho"
        description="Gerencie os locais supervisionáveis pela metodologia 5S."
        actions={can('work_environments.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/work-environments/create">Novo Ambiente de Trabalho</Link>
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? <Loading message="Carregando ambientes de trabalho..." /> : <DataTable columns={columns} rows={workEnvironments} emptyMessage="Nenhum ambiente de trabalho encontrado." />}
    </section>
  )
}

export default WorkEnvironmentsList
