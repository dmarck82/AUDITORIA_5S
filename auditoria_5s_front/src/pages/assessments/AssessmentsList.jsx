import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'
import { formatDateTime } from '../../utils/formatters'
import { getAssessmentStatusLabel } from './assessmentStatus'

function AssessmentsList() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [showFilters, setShowFilters] = useState(() => searchParams.size > 0)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)
  const filters = useMemo(() => ({
    status: searchParams.get('status') || '',
    questionnaire: searchParams.get('questionnaire') || '',
    organization: searchParams.get('organization') || '',
    unit: searchParams.get('unit') || '',
    sector: searchParams.get('sector') || '',
    person: searchParams.get('person') || '',
  }), [searchParams])
  const returnTo = `${location.pathname}${location.search}`

  const loadAssessments = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setAssessments(await fetchAllPages('/assessments'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as avaliações.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadAssessments()
  }, [loadAssessments])

  const deleteAssessment = async (assessment) => {
    if (!window.confirm(`Deseja excluir ${assessment.title || 'esta avaliação'}?`)) {
      return
    }

    try {
      await api.delete(`/assessments/${assessment.id}`)
      setAlert({ type: 'success', message: 'Avaliação excluída com sucesso.' })
      setAssessments((currentAssessments) => currentAssessments.filter((item) => item.id !== assessment.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a avaliação.' })
    }
  }

  const getFilterOptions = (getter, formatter = (value) => value) => Array.from(
    new Set(assessments.map(getter).filter(Boolean)),
  )
    .sort((first, second) => formatter(first).localeCompare(formatter(second), 'pt-BR', { sensitivity: 'base' }))
    .map((value) => ({ value, label: formatter(value) }))

  const filterOptions = useMemo(() => ({
    statuses: getFilterOptions((assessment) => assessment.status, getAssessmentStatusLabel),
    questionnaires: getFilterOptions((assessment) => assessment.questionnaire?.name),
    organizations: getFilterOptions((assessment) => assessment.organization?.name),
    units: getFilterOptions((assessment) => assessment.unit?.name),
    sectors: getFilterOptions((assessment) => assessment.sector?.name),
    people: getFilterOptions((assessment) => assessment.person?.name),
  }), [assessments])

  const filteredAssessments = useMemo(() => assessments.filter((assessment) => {
    if (filters.status && assessment.status !== filters.status) return false
    if (filters.questionnaire && assessment.questionnaire?.name !== filters.questionnaire) return false
    if (filters.organization && assessment.organization?.name !== filters.organization) return false
    if (filters.unit && assessment.unit?.name !== filters.unit) return false
    if (filters.sector && assessment.sector?.name !== filters.sector) return false
    if (filters.person && assessment.person?.name !== filters.person) return false

    return true
  }), [assessments, filters])

  const updateFilter = (event) => {
    const { name, value } = event.target
    const nextFilters = {
      ...filters,
      [name]: value,
    }
    const nextSearchParams = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, nextValue]) => {
      if (nextValue) {
        nextSearchParams.set(key, nextValue)
      }
    })

    setSearchParams(nextSearchParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const columns = [
    { key: 'title', label: 'Título', render: (assessment) => assessment.title || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (assessment) => <StatusBadge status={assessment.status}>{getAssessmentStatusLabel(assessment.status)}</StatusBadge>,
      searchValue: (assessment) => `${assessment.status} ${getAssessmentStatusLabel(assessment.status)}`,
      sortValue: (assessment) => getAssessmentStatusLabel(assessment.status),
    },
    {
      key: 'questionnaire',
      label: 'Questionário',
      render: (assessment) => getRelatedName(assessment, 'questionnaire', 'questionnaire_id'),
      searchValue: (assessment) => getRelatedName(assessment, 'questionnaire', 'questionnaire_id'),
      sortValue: (assessment) => getRelatedName(assessment, 'questionnaire', 'questionnaire_id'),
    },
    {
      key: 'organization',
      label: 'Organização',
      render: (assessment) => getRelatedName(assessment, 'organization', 'organization_id'),
      searchValue: (assessment) => getRelatedName(assessment, 'organization', 'organization_id'),
      sortValue: (assessment) => getRelatedName(assessment, 'organization', 'organization_id'),
    },
    {
      key: 'unit',
      label: 'Unidade',
      render: (assessment) => getRelatedName(assessment, 'unit', 'unit_id'),
      searchValue: (assessment) => getRelatedName(assessment, 'unit', 'unit_id'),
      sortValue: (assessment) => getRelatedName(assessment, 'unit', 'unit_id'),
    },
    {
      key: 'sector',
      label: 'Setor',
      render: (assessment) => getRelatedName(assessment, 'sector', 'sector_id'),
      searchValue: (assessment) => getRelatedName(assessment, 'sector', 'sector_id'),
      sortValue: (assessment) => getRelatedName(assessment, 'sector', 'sector_id'),
    },
    {
      key: 'person',
      label: 'Pessoa',
      render: (assessment) => getRelatedName(assessment, 'person', 'person_id'),
      searchValue: (assessment) => getRelatedName(assessment, 'person', 'person_id'),
      sortValue: (assessment) => getRelatedName(assessment, 'person', 'person_id'),
    },
    {
      key: 'expires_at',
      label: 'Expira em',
      render: (assessment) => formatDateTime(assessment.expires_at),
      sortValue: (assessment) => assessment.expires_at || '',
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (assessment) => <StatusBadge status={assessment.active ? 'active' : 'inactive'}>{assessment.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (assessment) => (assessment.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (assessment) => (assessment.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (assessment) => (
        <TableActions actions={[
          { label: 'Ver', state: { returnTo }, to: `/assessments/${assessment.id}`, type: 'view' },
          assessment.access_code && { label: 'Responder', target: '_blank', to: `/answer/${assessment.access_code}`, type: 'answer' },
          can('assessments.update') && { label: 'Editar', state: { returnTo }, to: `/assessments/${assessment.id}/edit`, type: 'edit' },
          can('assessments.delete') && { label: 'Excluir', onClick: () => deleteAssessment(assessment), type: 'delete' },
        ]} />
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Avaliações"
        description="Gerencie avaliações atribuídas às pessoas."
        actions={(
          <PageActions>
          <button className="btn btn-outline-secondary" type="button" onClick={() => setShowFilters((currentValue) => !currentValue)}>
            {showFilters ? 'Ocultar filtros' : 'Filtros'}
          </button>
          <button className="btn btn-outline-secondary" disabled={!hasActiveFilters} type="button" onClick={clearFilters}>
            Reset
          </button>
          {can('assessments.create') && <Link className="btn btn-primary" to="/assessments/create">Nova Avaliação</Link>}
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {showFilters && (
        <Card className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="status_filter">Status</label>
                <select className="form-select" id="status_filter" name="status" value={filters.status} onChange={updateFilter}>
                  <option value="">Todos</option>
                  {filterOptions.statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="questionnaire_filter">Questionário</label>
                <select className="form-select" id="questionnaire_filter" name="questionnaire" value={filters.questionnaire} onChange={updateFilter}>
                  <option value="">Todos</option>
                  {filterOptions.questionnaires.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="organization_filter">Organização</label>
                <select className="form-select" id="organization_filter" name="organization" value={filters.organization} onChange={updateFilter}>
                  <option value="">Todas</option>
                  {filterOptions.organizations.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="unit_filter">Unidade</label>
                <select className="form-select" id="unit_filter" name="unit" value={filters.unit} onChange={updateFilter}>
                  <option value="">Todas</option>
                  {filterOptions.units.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="sector_filter">Setor</label>
                <select className="form-select" id="sector_filter" name="sector" value={filters.sector} onChange={updateFilter}>
                  <option value="">Todos</option>
                  {filterOptions.sectors.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-xl-2">
                <label className="form-label" htmlFor="person_filter">Pessoa</label>
                <select className="form-select" id="person_filter" name="person" value={filters.person} onChange={updateFilter}>
                  <option value="">Todas</option>
                  {filterOptions.people.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            </div>
        </Card>
      )}

      {loading ? (
        <Loading message="Carregando avaliações..." />
      ) : (
        <DataTable columns={columns} rows={filteredAssessments} emptyMessage="Nenhuma avaliação encontrada." />
      )}
    </section>
  )
}

export default AssessmentsList
