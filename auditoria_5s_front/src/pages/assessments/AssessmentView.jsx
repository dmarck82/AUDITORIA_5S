import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { formatDateTime } from '../../utils/formatters'
import { getAssessmentStatusLabel } from './assessmentStatus'

function AssessmentView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const response = await api.get(`/assessments/${id}`)
        setAssessment(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a avaliação.' })
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [id])

  if (loading) {
    return <Loading message="Carregando avaliação..." />
  }

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes da Avaliação</h1>
          <p className="text-secondary mb-0">Informações da avaliação atribuída.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/assessments">Voltar</Link>
          {assessment && can('assessments.update') && <Link className="btn btn-primary" to={`/assessments/${assessment.id}/edit`}>Editar</Link>}
        </div>
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {assessment && (
        <div className="card"><div className="card-body"><dl className="row mb-0">
          <dt className="col-sm-3">Título</dt><dd className="col-sm-9">{assessment.title || '-'}</dd>
          <dt className="col-sm-3">Status</dt><dd className="col-sm-9">{getAssessmentStatusLabel(assessment.status)}</dd>
          <dt className="col-sm-3">Código de acesso</dt><dd className="col-sm-9"><code>{assessment.access_code}</code></dd>
          <dt className="col-sm-3">Questionário</dt><dd className="col-sm-9">{assessment.questionnaire?.name || '-'}</dd>
          <dt className="col-sm-3">Organização</dt><dd className="col-sm-9">{assessment.organization?.name || '-'}</dd>
          <dt className="col-sm-3">Unidade</dt><dd className="col-sm-9">{assessment.unit?.name || '-'}</dd>
          <dt className="col-sm-3">Setor</dt><dd className="col-sm-9">{assessment.sector?.name || '-'}</dd>
          <dt className="col-sm-3">Pessoa</dt><dd className="col-sm-9">{assessment.person?.name || '-'}</dd>
          <dt className="col-sm-3">Expira em</dt><dd className="col-sm-9">{formatDateTime(assessment.expires_at)}</dd>
          <dt className="col-sm-3">Respondida em</dt><dd className="col-sm-9">{formatDateTime(assessment.answered_at)}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9">{assessment.active ? 'Sim' : 'Não'}</dd>
          <dt className="col-sm-3">Criado por</dt><dd className="col-sm-9">{assessment.created_by?.name || '-'}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{assessment.updated_by?.name || '-'}</dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(assessment.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(assessment.updated_at)}</dd>
        </dl></div></div>
      )}
    </section>
  )
}

export default AssessmentView
