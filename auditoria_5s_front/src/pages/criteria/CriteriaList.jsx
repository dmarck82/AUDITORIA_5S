import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

function getDimensionLabel(criterion) {
  const methodology = [criterion.methodology_code, criterion.methodology_name].filter(Boolean).join(' - ')
  const dimension = [criterion.evaluation_dimension_code, criterion.evaluation_dimension_name].filter(Boolean).join(' - ')
  return [methodology, dimension].filter(Boolean).join(' / ') || '-'
}

function getDimensionOptionLabel(dimension) {
  const methodology = [dimension.methodology_code, dimension.methodology_name].filter(Boolean).join(' - ')
  const dimensionLabel = [dimension.code, dimension.name].filter(Boolean).join(' - ')
  return [methodology, dimensionLabel].filter(Boolean).join(' / ') || dimension.name || '-'
}

function getModelLabel(criterion) {
  return [criterion.evaluation_model_code, criterion.evaluation_model_name].filter(Boolean).join(' - ') || '-'
}

function CriteriaList() {
  const location = useLocation()
  const { can } = useAuth()
  const [criteria, setCriteria] = useState([])
  const [methodologies, setMethodologies] = useState([])
  const [dimensions, setDimensions] = useState([])
  const [models, setModels] = useState([])
  const [methodologyFilter, setMethodologyFilter] = useState('')
  const [dimensionFilter, setDimensionFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const filteredDimensions = useMemo(() => {
    if (!methodologyFilter) {
      return dimensions
    }

    return dimensions.filter((dimension) => String(dimension.methodology_id) === methodologyFilter)
  }, [dimensions, methodologyFilter])

  const loadCriteria = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    const params = {
      ...(methodologyFilter ? { methodology_id: methodologyFilter } : {}),
      ...(dimensionFilter ? { evaluation_dimension_id: dimensionFilter } : {}),
      ...(modelFilter ? { evaluation_model_id: modelFilter } : {}),
      ...(activeFilter !== '' ? { active: activeFilter } : {}),
    }

    try {
      const [loadedCriteria, loadedMethodologies, loadedDimensions, loadedModels] = await Promise.all([
        fetchAllPages('/criteria', { params }),
        fetchAllPages('/methodologies'),
        fetchAllPages('/evaluation-dimensions'),
        fetchAllPages('/evaluation-models'),
      ])

      setCriteria(loadedCriteria)
      setMethodologies(loadedMethodologies)
      setDimensions(loadedDimensions)
      setModels(loadedModels)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os critérios.' })
    } finally {
      setLoading(false)
    }
  }, [activeFilter, dimensionFilter, location.state?.message, methodologyFilter, modelFilter])

  useEffect(() => {
    loadCriteria()
  }, [loadCriteria])

  const changeMethodologyFilter = (event) => {
    setMethodologyFilter(event.target.value)
    setDimensionFilter('')
  }

  const clearFilters = () => {
    setMethodologyFilter('')
    setDimensionFilter('')
    setModelFilter('')
    setActiveFilter('')
  }

  const deleteCriterion = async (criterion) => {
    if (!window.confirm(`Deseja excluir ${criterion.code || 'este critério'}?`)) {
      return
    }

    try {
      await api.delete(`/criteria/${criterion.id}`)
      setAlert({ type: 'success', message: 'Critério excluído com sucesso.' })
      setCriteria((currentCriteria) => currentCriteria.filter((item) => item.id !== criterion.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir o critério.' })
    }
  }

  const columns = [
    { key: 'code', label: 'Código', render: (criterion) => criterion.code || '-' },
    { key: 'text', label: 'Texto universal', render: (criterion) => criterion.text || '-' },
    { key: 'dimension', label: 'Dimensão', render: getDimensionLabel, searchValue: getDimensionLabel, sortValue: getDimensionLabel },
    { key: 'model', label: 'Modelo', render: getModelLabel, searchValue: getModelLabel, sortValue: getModelLabel },
    {
      key: 'active',
      label: 'Ativo',
      render: (criterion) => <StatusBadge status={criterion.active ? 'active' : 'inactive'}>{criterion.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (criterion) => (criterion.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (criterion) => (criterion.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (criterion) => <TableActions actions={[
        { label: 'Ver', to: `/criteria/${criterion.id}`, type: 'view' },
        can('criteria.update') && { label: 'Editar', to: `/criteria/${criterion.id}/edit`, type: 'edit' },
        can('criteria.delete') && { label: 'Excluir', onClick: () => deleteCriterion(criterion), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Critérios Universais"
        description="Gerencie critérios reutilizáveis vinculados a dimensões e modelos."
        actions={can('criteria.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/criteria/create">Novo Critério</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="methodology-filter">Metodologia</label>
          <select className="form-select" id="methodology-filter" value={methodologyFilter} onChange={changeMethodologyFilter}>
            <option value="">Todas</option>
            {methodologies.map((methodology) => (
              <option key={methodology.id} value={methodology.id}>{methodology.code} - {methodology.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="dimension-filter">Dimensão</label>
          <select className="form-select" id="dimension-filter" value={dimensionFilter} onChange={(event) => setDimensionFilter(event.target.value)}>
            <option value="">Todas</option>
            {filteredDimensions.map((dimension) => (
              <option key={dimension.id} value={dimension.id}>{getDimensionOptionLabel(dimension)}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="model-filter">Modelo</label>
          <select className="form-select" id="model-filter" value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
            <option value="">Todos</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>{model.code} - {model.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4 col-xl-2">
          <label className="form-label" htmlFor="active-filter">Status</label>
          <select className="form-select" id="active-filter" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
            <option value="">Todos</option>
            <option value="1">Ativos</option>
            <option value="0">Inativos</option>
          </select>
        </div>
        <div className="col-md-2 col-xl-1 d-grid">
          <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>Limpar</button>
        </div>
      </div>

      {loading ? (
        <Loading message="Carregando critérios..." />
      ) : (
        <DataTable columns={columns} rows={criteria} emptyMessage="Nenhum critério encontrado." />
      )}
    </section>
  )
}

export default CriteriaList
