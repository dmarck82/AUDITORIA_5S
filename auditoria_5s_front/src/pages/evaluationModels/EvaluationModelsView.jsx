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

function EvaluationModelsView() {
  const { id } = useParams()
  const location = useLocation()
  const { can } = useAuth()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderedOptions, setReorderedOptions] = useState([])
  const [draggedOptionId, setDraggedOptionId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadModel = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      const response = await api.get(`/evaluation-models/${id}`)
      const nextModel = response.data.data || response.data
      const options = [...(nextModel.evaluation_model_options || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order))

      setModel(nextModel)
      setReorderedOptions(options)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar o modelo de avaliação.' })
    } finally {
      setLoading(false)
    }
  }, [id, location.state?.message])

  useEffect(() => {
    loadModel()
  }, [loadModel])

  const deleteOption = async (option) => {
    if (!window.confirm(`Deseja excluir ${option.value || 'esta opção'}?`)) {
      return
    }

    try {
      await api.delete(`/evaluation-model-options/${option.id}`)
      setAlert({ type: 'success', message: 'Opção excluída com sucesso.' })
      await loadModel()
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a opção.' })
    }
  }

  const moveOption = (sourceOptionId, targetOptionId) => {
    if (!sourceOptionId || sourceOptionId === targetOptionId) {
      return
    }

    setReorderedOptions((currentOptions) => {
      const sourceIndex = currentOptions.findIndex((option) => option.id === sourceOptionId)
      const targetIndex = currentOptions.findIndex((option) => option.id === targetOptionId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentOptions
      }

      const nextOptions = [...currentOptions]
      const [movedOption] = nextOptions.splice(sourceIndex, 1)
      nextOptions.splice(targetIndex, 0, movedOption)

      return nextOptions
    })
  }

  const startReorder = () => {
    setAlert(null)
    setReorderedOptions([...(model?.evaluation_model_options || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order)))
    setReorderMode(true)
  }

  const finishReorder = async () => {
    setSavingOrder(true)
    setAlert(null)

    try {
      await api.post('/evaluation-model-options/reorder', {
        evaluation_model_id: Number(id),
        options: reorderedOptions.map((option) => option.id),
      })
      setAlert({ type: 'success', message: 'Ordem das opções atualizada com sucesso.' })
      setReorderMode(false)
      setDraggedOptionId(null)
      await loadModel()
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message === 'All evaluation model options must be sent to reorder.'
          ? 'Todas as opções do modelo devem ser enviadas para alterar a ordem.'
          : 'Não foi possível atualizar a ordem das opções.',
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

  const optionColumns = [
    { key: 'sort_order', label: 'Ordem', render: (option) => option.sort_order, sortValue: (option) => option.sort_order },
    { key: 'value', label: 'Valor', render: (option) => option.value || '-' },
    { key: 'description', label: 'Descrição', render: (option) => option.description || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (option) => <StatusBadge status={option.active ? 'active' : 'inactive'}>{option.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (option) => (option.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (option) => (option.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (option) => <TableActions actions={[
        { label: 'Ver', to: `/evaluation-model-options/${option.id}`, type: 'view' },
        can('evaluation_model_options.update') && { label: 'Editar', to: `/evaluation-model-options/${option.id}/edit`, type: 'edit' },
        can('evaluation_model_options.delete') && { label: 'Excluir', onClick: () => deleteOption(option), type: 'delete' },
      ]} />,
    },
  ]

  if (loading) {
    return <Loading message="Carregando modelo de avaliação..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Modelo de Avaliação"
        description="Informações do modelo reutilizável."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/evaluation-models">Voltar</Link>
            {model && can('evaluation_models.update') && <Link className="btn btn-primary" to={`/evaluation-models/${model.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {model && (
        <>
          <Card className="mb-4">
            <dl className="row mb-0">
              <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{model.code || '-'}</dd>
              <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{model.name || '-'}</dd>
              <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{model.description || '-'}</dd>
              <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={model.active ? 'active' : 'inactive'}>{model.active ? 'Sim' : 'Não'}</StatusBadge></dd>
              <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(model.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(model.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{model.updated_by_name || '-'}</dd>
            </dl>
          </Card>

          <PageHeader
            title="Opções"
            description="Ordene e gerencie os valores disponíveis deste modelo."
            actions={(
              <PageActions>
                {can('evaluation_model_options.update') && (
                  <button className={`btn ${reorderMode ? 'btn-success' : 'btn-outline-secondary'}`} type="button" disabled={savingOrder || (model.evaluation_model_options || []).length === 0} onClick={toggleReorder}>
                    {savingOrder ? 'Salvando...' : reorderMode ? 'Concluir' : 'Alterar Ordem'}
                  </button>
                )}
                {can('evaluation_model_options.create') && !reorderMode && <Link className="btn btn-primary" to={`/evaluation-models/${model.id}/options/create`}>Nova Opção</Link>}
              </PageActions>
            )}
          />

          {reorderMode ? (
            <Card>
              <div className="alert alert-info">
                Arraste uma opção para reposicioná-la. Clique em <strong>Concluir</strong> para salvar a nova ordem.
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '72px' }}>Mover</th>
                      <th className="text-center" style={{ width: '100px' }}>Ordem</th>
                      <th style={{ width: '140px' }}>Valor</th>
                      <th>Descrição</th>
                      <th className="text-center" style={{ width: '100px' }}>Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderedOptions.map((option, index) => (
                      <tr
                        draggable
                        className={draggedOptionId === option.id ? 'table-primary' : ''}
                        key={option.id}
                        style={{ cursor: 'grab' }}
                        onDragEnd={() => setDraggedOptionId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragStart={() => setDraggedOptionId(option.id)}
                        onDrop={() => moveOption(draggedOptionId, option.id)}
                      >
                        <td className="text-center text-secondary">
                          <i className="bi bi-grip-vertical" aria-hidden="true" />
                          <span className="visually-hidden">Arrastar opção</span>
                        </td>
                        <td>{index + 1}</td>
                        <td>{option.value || '-'}</td>
                        <td>{option.description || '-'}</td>
                        <td><StatusBadge status={option.active ? 'active' : 'inactive'}>{option.active ? 'Sim' : 'Não'}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <DataTable columns={optionColumns} rows={model.evaluation_model_options || []} emptyMessage="Nenhuma opção encontrada." />
          )}
        </>
      )}
    </section>
  )
}

export default EvaluationModelsView
