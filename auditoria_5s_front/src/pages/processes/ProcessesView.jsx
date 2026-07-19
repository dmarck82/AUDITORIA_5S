import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function getSectorLabel(process) {
  const sector = process?.sector
  return [sector?.name, sector?.unit?.name, sector?.unit?.organization_name].filter(Boolean).join(' - ') || '-'
}

function ProcessesView() {
  const { id } = useParams()
  const location = useLocation()
  const { can } = useAuth()
  const [process, setProcess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderedActivities, setReorderedActivities] = useState([])
  const [draggedActivityId, setDraggedActivityId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadProcess = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      const response = await api.get(`/processes/${id}`)
      const nextProcess = response.data.data || response.data
      const activities = [...(nextProcess.activities || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order))

      setProcess(nextProcess)
      setReorderedActivities(activities)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar o processo.' })
    } finally {
      setLoading(false)
    }
  }, [id, location.state?.message])

  useEffect(() => {
    loadProcess()
  }, [loadProcess])

  const deleteActivity = async (activity) => {
    if (!window.confirm(`Deseja excluir ${activity.name || 'esta atividade'}?`)) {
      return
    }

    try {
      await api.delete(`/activities/${activity.id}`)
      setAlert({ type: 'success', message: 'Atividade excluída com sucesso.' })
      await loadProcess()
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir a atividade.' })
    }
  }

  const moveActivity = (sourceActivityId, targetActivityId) => {
    if (!sourceActivityId || sourceActivityId === targetActivityId) {
      return
    }

    setReorderedActivities((currentActivities) => {
      const sourceIndex = currentActivities.findIndex((activity) => activity.id === sourceActivityId)
      const targetIndex = currentActivities.findIndex((activity) => activity.id === targetActivityId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentActivities
      }

      const nextActivities = [...currentActivities]
      const [movedActivity] = nextActivities.splice(sourceIndex, 1)
      nextActivities.splice(targetIndex, 0, movedActivity)

      return nextActivities
    })
  }

  const startReorder = () => {
    setAlert(null)
    setReorderedActivities([...(process?.activities || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order)))
    setReorderMode(true)
  }

  const finishReorder = async () => {
    setSavingOrder(true)
    setAlert(null)

    try {
      await api.post('/activities/reorder', {
        process_id: Number(id),
        activities: reorderedActivities.map((activity) => activity.id),
      })
      setAlert({ type: 'success', message: 'Ordem das atividades atualizada com sucesso.' })
      setReorderMode(false)
      setDraggedActivityId(null)
      await loadProcess()
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message === 'All process activities must be sent to reorder.'
          ? 'Todas as atividades do processo devem ser enviadas para alterar a ordem.'
          : 'Não foi possível atualizar a ordem das atividades.',
      })
    } finally {
      setSavingOrder(false)
    }
  }

  const toggleReorder = () => {
    if (reorderMode) {
      finishReorder()
      return
    }

    startReorder()
  }

  const activityColumns = [
    {
      key: 'sort_order',
      label: 'Ordem',
      render: (activity) => activity.sort_order,
      sortValue: (activity) => activity.sort_order,
    },
    { key: 'name', label: 'Nome', render: (activity) => activity.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (activity) => <StatusBadge status={activity.active ? 'active' : 'inactive'}>{activity.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (activity) => (activity.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (activity) => (activity.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (activity) => <TableActions actions={[
        can('activities.update') && { label: 'Editar', to: `/activities/${activity.id}/edit`, type: 'edit' },
        can('activities.delete') && { label: 'Excluir', onClick: () => deleteActivity(activity), type: 'delete' },
      ]} />,
    },
  ]

  if (loading) {
    return <Loading message="Carregando processo..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Processo"
        description="Processo e atividades vinculadas."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/processes">Voltar</Link>
            {process && can('processes.update') && <Link className="btn btn-primary" to={`/processes/${process.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {process && (
        <>
          <Card className="mb-4">
            <dl className="row mb-0">
              <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{process.name || '-'}</dd>
              <dt className="col-sm-3">Setor</dt><dd className="col-sm-9">{getSectorLabel(process)}</dd>
              <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{process.description || '-'}</dd>
              <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={process.active ? 'active' : 'inactive'}>{process.active ? 'Sim' : 'Não'}</StatusBadge></dd>
              <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(process.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(process.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{process.updated_by_name || '-'}</dd>
            </dl>
          </Card>

          <PageHeader
            title="Atividades"
            description="Ordene e gerencie as atividades deste processo."
            actions={(
              <PageActions>
                {can('activities.update') && (
                  <button className={`btn ${reorderMode ? 'btn-success' : 'btn-outline-secondary'}`} type="button" disabled={savingOrder || (process.activities || []).length === 0} onClick={toggleReorder}>
                    {savingOrder ? 'Salvando...' : reorderMode ? 'Concluir' : 'Alterar Ordem'}
                  </button>
                )}
                {can('activities.create') && !reorderMode && <Link className="btn btn-primary" to={`/processes/${process.id}/activities/create`}>Nova Atividade</Link>}
              </PageActions>
            )}
          />

          {reorderMode ? (
            <Card>
              <div className="alert alert-info">
                Arraste uma atividade para reposicioná-la. Clique em <strong>Concluir</strong> para salvar a nova ordem.
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '72px' }}>Mover</th>
                      <th className="text-center" style={{ width: '100px' }}>Ordem</th>
                      <th className="text-center">Atividade</th>
                      <th className="text-center" style={{ width: '100px' }}>Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderedActivities.map((activity, index) => (
                      <tr
                        draggable
                        className={draggedActivityId === activity.id ? 'table-primary' : ''}
                        key={activity.id}
                        style={{ cursor: 'grab' }}
                        onDragEnd={() => setDraggedActivityId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragStart={() => setDraggedActivityId(activity.id)}
                        onDrop={() => moveActivity(draggedActivityId, activity.id)}
                      >
                        <td className="text-center text-secondary">
                          <i className="bi bi-grip-vertical" aria-hidden="true" />
                          <span className="visually-hidden">Arrastar atividade</span>
                        </td>
                        <td>{index + 1}</td>
                        <td>{activity.name || '-'}</td>
                        <td><StatusBadge status={activity.active ? 'active' : 'inactive'}>{activity.active ? 'Sim' : 'Não'}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <DataTable columns={activityColumns} rows={process.activities || []} emptyMessage="Nenhuma atividade encontrada." />
          )}
        </>
      )}
    </section>
  )
}

export default ProcessesView

