import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'
import { formatDateTime } from '../../utils/formatters'
import { getAssessmentStatusLabel } from './assessmentStatus'

function AssessmentsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

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

  const columns = [
    { key: 'title', label: 'Título', render: (assessment) => assessment.title || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (assessment) => getAssessmentStatusLabel(assessment.status),
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
      render: (assessment) => <span className={`badge text-bg-${assessment.active ? 'success' : 'secondary'}`}>{assessment.active ? 'Sim' : 'Não'}</span>,
      searchValue: (assessment) => (assessment.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (assessment) => (assessment.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (assessment) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/assessments/${assessment.id}`}>Ver</Link>
          {can('assessments.update') && <Link className="btn btn-outline-primary" to={`/assessments/${assessment.id}/edit`}>Editar</Link>}
          {can('assessments.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteAssessment(assessment)}>Excluir</button>}
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Avaliações</h1>
          <p className="text-secondary mb-0">Gerencie avaliações atribuídas às pessoas.</p>
        </div>
        {can('assessments.create') && <Link className="btn btn-primary" to="/assessments/create">Nova Avaliação</Link>}
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando avaliações..." />
      ) : (
        <DataTable columns={columns} rows={assessments} emptyMessage="Nenhuma avaliação encontrada." />
      )}
    </section>
  )
}

export default AssessmentsList
