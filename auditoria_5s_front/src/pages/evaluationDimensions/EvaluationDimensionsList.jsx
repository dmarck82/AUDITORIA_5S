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

function getMethodologyLabel(dimension) {
  return [dimension.methodology_code, dimension.methodology_name].filter(Boolean).join(' - ') || '-'
}

function EvaluationDimensionsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [dimensions, setDimensions] = useState([])
  const [methodologies, setMethodologies] = useState([])
  const [methodologyFilter, setMethodologyFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadDimensions = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      const [loadedDimensions, loadedMethodologies] = await Promise.all([
        fetchAllPages('/evaluation-dimensions', {
          params: methodologyFilter ? { methodology_id: methodologyFilter } : {},
        }),
        fetchAllPages('/methodologies'),
      ])

      setDimensions(loadedDimensions)
      setMethodologies(loadedMethodologies)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as dimensões.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message, methodologyFilter])

  useEffect(() => {
    loadDimensions()
  }, [loadDimensions])

  const deleteDimension = async (dimension) => {
    if (!window.confirm(`Deseja excluir ${dimension.name || 'esta dimensão'}?`)) {
      return
    }

    try {
      await api.delete(`/evaluation-dimensions/${dimension.id}`)
      setAlert({ type: 'success', message: 'Dimensão excluída com sucesso.' })
      setDimensions((currentDimensions) => currentDimensions.filter((item) => item.id !== dimension.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a dimensão.' })
    }
  }

  const columns = [
    { key: 'sort_order', label: 'Ordem', render: (dimension) => dimension.sort_order || '-', sortValue: (dimension) => dimension.sort_order || 0 },
    { key: 'code', label: 'Código', render: (dimension) => dimension.code || '-' },
    { key: 'name', label: 'Nome', render: (dimension) => dimension.name || '-' },
    { key: 'methodology', label: 'Metodologia', render: getMethodologyLabel, searchValue: getMethodologyLabel, sortValue: getMethodologyLabel },
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

  return (
    <section>
      <PageHeader
        title="Dimensões de Avaliação"
        description="Gerencie dimensões vinculadas às metodologias."
        actions={can('evaluation_dimensions.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/evaluation-dimensions/create">Nova Dimensão</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />


      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-5 col-lg-4">
          <label className="form-label" htmlFor="methodology-filter">Metodologia</label>
          <select
            className="form-select"
            id="methodology-filter"
            value={methodologyFilter}
            onChange={(event) => setMethodologyFilter(event.target.value)}
          >
            <option value="">Todas</option>
            {methodologies.map((methodology) => (
              <option key={methodology.id} value={methodology.id}>{methodology.code} - {methodology.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Carregando dimensões..." />
      ) : (
        <DataTable columns={columns} rows={dimensions} emptyMessage="Nenhuma dimensão encontrada." />
      )}
    </section>
  )
}

export default EvaluationDimensionsList
