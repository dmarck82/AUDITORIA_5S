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

function getSectorLabel(process) {
  const sectorName = getRelatedName(process, 'sector', 'sector_id')
  const unitName = process.sector?.unit?.name

  return [sectorName, unitName].filter(Boolean).join(' - ')
}

function ProcessesList() {
  const location = useLocation()
  const { can } = useAuth()
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadProcesses = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setProcesses(await fetchAllPages('/processes'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os processos.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadProcesses()
  }, [loadProcesses])

  const deleteProcess = async (process) => {
    if (!window.confirm(`Deseja excluir ${process.name || 'este processo'}?`)) {
      return
    }

    try {
      await api.delete(`/processes/${process.id}`)
      setAlert({ type: 'success', message: 'Processo excluído com sucesso.' })
      setProcesses((currentProcesses) => currentProcesses.filter((item) => item.id !== process.id))
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.status === 409
          ? 'Este processo não pode ser excluído porque possui atividades vinculadas.'
          : 'Não foi possível excluir o processo.',
      })
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (process) => process.name || '-' },
    {
      key: 'sector',
      label: 'Setor',
      render: getSectorLabel,
      searchValue: getSectorLabel,
      sortValue: getSectorLabel,
    },
    {
      key: 'activities_count',
      label: 'Atividades',
      render: (process) => process.activities_count ?? 0,
      sortValue: (process) => process.activities_count ?? 0,
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (process) => <StatusBadge status={process.active ? 'active' : 'inactive'}>{process.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (process) => (process.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (process) => (process.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (process) => <TableActions actions={[
        { label: 'Ver', to: `/processes/${process.id}`, type: 'view' },
        can('processes.update') && { label: 'Editar', to: `/processes/${process.id}/edit`, type: 'edit' },
        can('processes.delete') && { label: 'Excluir', onClick: () => deleteProcess(process), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Processos"
        description="Gerencie processos vinculados aos setores."
        actions={can('processes.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/processes/create">Novo Processo</Link>
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? <Loading message="Carregando processos..." /> : <DataTable columns={columns} rows={processes} emptyMessage="Nenhum processo encontrado." />}
    </section>
  )
}

export default ProcessesList

