import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, EmptyState, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'
import { getAssessmentStatusLabel } from './assessmentStatus'
import { getQuestionCategoryLabel } from '../questions/questionCategories'

const scoreLabels = {
  1: '1 - Muito Ruim',
  2: '2 - Ruim',
  3: '3 - Regular',
  4: '4 - Bom',
  5: '5 - Muito Bom',
}

function AssessmentView() {
  const { id } = useParams()
  const location = useLocation()
  const { can } = useAuth()
  const returnTo = location.state?.returnTo || '/assessments'
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
      <PageHeader
        title="Detalhes da Avaliação"
        description="Informações da avaliação atribuída."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to={returnTo}>Voltar</Link>
          {assessment && can('assessments.update') && <Link className="btn btn-primary" state={{ returnTo }} to={`/assessments/${assessment.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {assessment && (
        <div className="vstack gap-4">
          <Card><dl className="row mb-0">
            <dt className="col-sm-3">Título</dt><dd className="col-sm-9">{assessment.title || '-'}</dd>
            <dt className="col-sm-3">Status</dt><dd className="col-sm-9"><StatusBadge status={assessment.status}>{getAssessmentStatusLabel(assessment.status)}</StatusBadge></dd>
            <dt className="col-sm-3">Código de acesso</dt><dd className="col-sm-9"><code>{assessment.access_code}</code></dd>
            <dt className="col-sm-3">Questionário</dt><dd className="col-sm-9">{assessment.questionnaire?.name || '-'}</dd>
            <dt className="col-sm-3">Organização</dt><dd className="col-sm-9">{assessment.organization?.name || '-'}</dd>
            <dt className="col-sm-3">Unidade</dt><dd className="col-sm-9">{assessment.unit?.name || '-'}</dd>
            <dt className="col-sm-3">Setor</dt><dd className="col-sm-9">{assessment.sector?.name || '-'}</dd>
            <dt className="col-sm-3">Pessoa</dt><dd className="col-sm-9">{assessment.person?.name || '-'}</dd>
            <dt className="col-sm-3">Expira em</dt><dd className="col-sm-9">{formatDateTime(assessment.expires_at)}</dd>
            <dt className="col-sm-3">Respondida em</dt><dd className="col-sm-9">{formatDateTime(assessment.answered_at)}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={assessment.active ? 'active' : 'inactive'}>{assessment.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado por</dt><dd className="col-sm-9">{assessment.created_by?.name || '-'}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{assessment.updated_by?.name || '-'}</dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(assessment.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(assessment.updated_at)}</dd>
          </dl></Card>

          <section>
            <h2 className="h5 mb-3">Respostas</h2>
            {assessment.answers?.length > 0 ? (
              <div className="vstack gap-3">
                {assessment.answers.map((answer) => {
                  const hasEvidences = answer.evidences?.length > 0

                  return (
                    <Card key={answer.id}>
                        <div className="row g-4 align-items-stretch">
                          <div className="col-lg-8 d-flex flex-column">
                            <div className="mb-3">
                              <div>
                                <span className="badge text-bg-secondary me-2">{answer.question?.sort_order}</span>
                                <span className="fw-semibold">{answer.question?.question || 'Pergunta'}</span>
                              </div>
                            </div>
                            <dl className="row mb-0">
                              <dt className="col-sm-3">Pontuação</dt><dd className="col-sm-9">{scoreLabels[answer.score] || answer.score || '-'}</dd>
                              <dt className="col-sm-3">Observação</dt><dd className="col-sm-9">{answer.observation || '-'}</dd>
                            </dl>

                            <div className="text-secondary small mt-auto pt-3">
                              {getQuestionCategoryLabel(answer.question?.category)}
                            </div>
                          </div>

                          <div className="col-lg-4">
                            <h3 className="h6 mb-3 text-center">Evidências</h3>
                            {hasEvidences ? (
                              <div className="d-flex flex-wrap justify-content-center gap-3">
                                {answer.evidences.map((evidence) => (
                                  <a className="text-decoration-none" href={evidence.url} key={evidence.id} rel="noreferrer" target="_blank">
                                    <img
                                      alt={evidence.original_name}
                                      className="rounded border"
                                      src={evidence.url}
                                      style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                                    />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-secondary text-center mb-0">Nenhuma evidência registrada.</p>
                            )}
                          </div>
                        </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card><EmptyState title="Nenhuma resposta registrada." /></Card>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default AssessmentView
