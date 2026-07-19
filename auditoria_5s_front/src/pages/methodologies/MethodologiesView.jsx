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

function MethodologiesView() {
  const { id } = useParams()
  const location = useLocation()
  const { can } = useAuth()
  const [methodology, setMethodology] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderedDimensions, setReorderedDimensions] = useState([])
  const [draggedDimensionId, setDraggedDimensionId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadMethodology = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      const response = await api.get(`/methodologies/${id}`)
      const nextMethodology = response.data.data || response.data
      const dimensions = [...(nextMethodology.evaluation_dimensions || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order))

      setMethodology(nextMethodology)
      setReorderedDimensions(dimensions)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar a metodologia.' })
    } finally {
      setLoading(false)
    }
  }, [id, location.state?.message])

  useEffect(() => {
    loadMethodology()
  }, [loadMethodology])

  const deleteDimension = async (dimension) => {
    if (!window.confirm(`Deseja excluir ${dimension.name || 'esta dimensão'}?`)) {
      return
    }

    try {
      await api.delete(`/evaluation-dimensions/${dimension.id}`)
      setAlert({ type: 'success', message: 'Dimensão excluída com sucesso.' })
      await loadMethodology()
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a dimensão.' })
    }
  }

  const moveDimension = (sourceDimensionId, targetDimensionId) => {
    if (!sourceDimensionId || sourceDimensionId === targetDimensionId) {
      return
    }

    setReorderedDimensions((currentDimensions) => {
      const sourceIndex = currentDimensions.findIndex((dimension) => dimension.id === sourceDimensionId)
      const targetIndex = currentDimensions.findIndex((dimension) => dimension.id === targetDimensionId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentDimensions
      }

      const nextDimensions = [...currentDimensions]
      const [movedDimension] = nextDimensions.splice(sourceIndex, 1)
      nextDimensions.splice(targetIndex, 0, movedDimension)

      return nextDimensions
    })
  }

  const startReorder = () => {
    setAlert(null)
    setReorderedDimensions([...(methodology?.evaluation_dimensions || [])].sort((first, second) => Number(first.sort_order) - Number(second.sort_order)))
    setReorderMode(true)
  }

  const finishReorder = async () => {
    setSavingOrder(true)
    setAlert(null)

    try {
      await api.post('/evaluation-dimensions/reorder', {
        methodology_id: Number(id),
        dimensions: reorderedDimensions.map((dimension) => dimension.id),
      })
      setAlert({ type: 'success', message: 'Ordem das dimensões atualizada com sucesso.' })
      setReorderMode(false)
      setDraggedDimensionId(null)
      await loadMethodology()
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message === 'All methodology dimensions must be sent to reorder.'
          ? 'Todas as dimensões da metodologia devem ser enviadas para alterar a ordem.'
          : 'Não foi possível atualizar a ordem das dimensões.',
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

  const dimensionColumns = [
    { key: 'sort_order', label: 'Ordem', render: (dimension) => dimension.sort_order, sortValue: (dimension) => dimension.sort_order },
    { key: 'code', label: 'Código', render: (dimension) => dimension.code || '-' },
    { key: 'name', label: 'Nome', render: (dimension) => dimension.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (dimension) => <StatusBadge status={dimension.active ? 'active' : 'inactive'}>{dimension.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (dimension) => (dimension.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (dimension) => (dimension.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (dimension) => <TableActions actions={[
        { label: 'Ver', to: `/evaluation-dimensions/${dimension.id}`, type: 'view' },
        can('evaluation_dimensions.update') && { label: 'Editar', to: `/evaluation-dimensions/${dimension.id}/edit`, type: 'edit' },
        can('evaluation_dimensions.delete') && { label: 'Excluir', onClick: () => deleteDimension(dimension), type: 'delete' },
      ]} />,
    },
  ]

  if (loading) {
    return <Loading message="Carregando metodologia..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes da Metodologia"
        description="Informações do cadastro metodológico."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/methodologies">Voltar</Link>
            {methodology && can('methodologies.update') && <Link className="btn btn-primary" to={`/methodologies/${methodology.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {methodology && (
        <>
          <Card className="mb-4">
            <dl className="row mb-0">
              <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{methodology.code || '-'}</dd>
              <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{methodology.name || '-'}</dd>
              <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{methodology.description || '-'}</dd>
              <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={methodology.active ? 'active' : 'inactive'}>{methodology.active ? 'Sim' : 'Não'}</StatusBadge></dd>
              <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(methodology.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(methodology.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{methodology.updated_by_name || '-'}</dd>
            </dl>
          </Card>

          <PageHeader
            title="Dimensões de Avaliação"
            description="Ordene e gerencie as dimensões desta metodologia."
            actions={(
              <PageActions>
                {can('evaluation_dimensions.update') && (
                  <button className={`btn ${reorderMode ? 'btn-success' : 'btn-outline-secondary'}`} type="button" disabled={savingOrder || (methodology.evaluation_dimensions || []).length === 0} onClick={toggleReorder}>
                    {savingOrder ? 'Salvando...' : reorderMode ? 'Concluir' : 'Alterar Ordem'}
                  </button>
                )}
                {can('evaluation_dimensions.create') && !reorderMode && <Link className="btn btn-primary" to={`/methodologies/${methodology.id}/evaluation-dimensions/create`}>Nova Dimensão</Link>}
              </PageActions>
            )}
          />

          {reorderMode ? (
            <Card>
              <div className="alert alert-info">
                Arraste uma dimensão para reposicioná-la. Clique em <strong>Concluir</strong> para salvar a nova ordem.
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '72px' }}>Mover</th>
                      <th className="text-center" style={{ width: '100px' }}>Ordem</th>
                      <th>Código</th>
                      <th>Dimensão</th>
                      <th className="text-center" style={{ width: '100px' }}>Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderedDimensions.map((dimension, index) => (
                      <tr
                        draggable
                        className={draggedDimensionId === dimension.id ? 'table-primary' : ''}
                        key={dimension.id}
                        style={{ cursor: 'grab' }}
                        onDragEnd={() => setDraggedDimensionId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragStart={() => setDraggedDimensionId(dimension.id)}
                        onDrop={() => moveDimension(draggedDimensionId, dimension.id)}
                      >
                        <td className="text-center text-secondary">
                          <i className="bi bi-grip-vertical" aria-hidden="true" />
                          <span className="visually-hidden">Arrastar dimensão</span>
                        </td>
                        <td>{index + 1}</td>
                        <td>{dimension.code || '-'}</td>
                        <td>{dimension.name || '-'}</td>
                        <td><StatusBadge status={dimension.active ? 'active' : 'inactive'}>{dimension.active ? 'Sim' : 'Não'}</StatusBadge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <DataTable columns={dimensionColumns} rows={methodology.evaluation_dimensions || []} emptyMessage="Nenhuma dimensão encontrada." />
          )}
        </>
      )}
    </section>
  )
}

export default MethodologiesView
