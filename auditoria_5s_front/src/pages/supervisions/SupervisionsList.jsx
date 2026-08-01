import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'
import { formatDateTime } from '../../utils/formatters'
import { getSupervisionStatusVariant } from './supervisionStatus'

function formatPercentage(value) {
  return value === null || value === undefined ? '-' : `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function SupervisionsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [supervisions, setSupervisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadSupervisions = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) setAlert(null)

    try {
      setSupervisions(await fetchAllPages('/supervisions'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as supervisões.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => { loadSupervisions() }, [loadSupervisions])

  const deleteSupervision = async (supervision) => {
    if (!window.confirm(`Deseja excluir a supervisão #${supervision.id}?`)) return

    try {
      await api.delete(`/supervisions/${supervision.id}`)
      setSupervisions((current) => current.filter((item) => item.id !== supervision.id))
      setAlert({ type: 'success', message: 'Supervisão excluída com sucesso.' })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a supervisão.' })
    }
  }

  const columns = [
    { key: 'id', label: 'Número', render: (supervision) => `#${supervision.id}` },
    { key: 'work_environment_name', label: 'Ambiente de Trabalho' },
    { key: 'local_2_name', label: 'Setor/OMDS' },
    { key: 'responsible_user_name', label: 'Responsável atual' },
    {
      key: 'status',
      label: 'Status',
      render: (supervision) => <StatusBadge variant={getSupervisionStatusVariant(supervision.status)}>{supervision.status_label}</StatusBadge>,
      searchValue: (supervision) => supervision.status_label,
      sortValue: (supervision) => supervision.status_label,
    },
    {
      key: 'percentage',
      label: 'Resultado',
      render: (supervision) => formatPercentage(supervision.score?.percentage),
      sortValue: (supervision) => supervision.score?.percentage ?? -1,
    },
    {
      key: 'started_at',
      label: 'Criada em',
      render: (supervision) => formatDateTime(supervision.started_at),
      sortValue: (supervision) => supervision.started_at,
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (supervision) => <TableActions actions={[
        { label: 'Ver', to: `/supervisions/${supervision.id}`, type: 'view' },
        supervision.actions?.can_configure && { label: 'Configurar', to: `/supervisions/${supervision.id}/edit`, type: 'edit' },
        supervision.actions?.can_answer && { label: 'Responder', to: `/supervisions/${supervision.id}/edit`, type: 'edit' },
        supervision.actions?.can_assume && { label: 'Assumir responsabilidade', to: `/supervisions/${supervision.id}`, icon: 'bi-person-check', variant: 'outline-warning' },
        supervision.actions?.can_delete && { label: 'Excluir', onClick: () => deleteSupervision(supervision), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Supervisões 5S"
        description="Acompanhe as supervisões permitidas pelo seu setor e responsabilidade."
        actions={can('supervisions.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/supervisions/create">Nova Supervisão</Link>
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? <Loading message="Carregando supervisões..." /> : <DataTable columns={columns} rows={supervisions} emptyMessage="Nenhuma supervisão encontrada para o seu escopo." />}
    </section>
  )
}

export default SupervisionsList
