import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function QuestionnairesView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [questionnaire, setQuestionnaire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const response = await api.get(`/questionnaires/${id}`)
        setQuestionnaire(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o questionário.' })
      } finally {
        setLoading(false)
      }
    }

    loadQuestionnaire()
  }, [id])

  if (loading) {
    return <Loading message="Carregando questionário..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Questionário"
        description="Informações do modelo de perguntas."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/questionnaires">Voltar</Link>
          {questionnaire && can('questions.view') && <Link className="btn btn-outline-secondary" to={`/questions?questionnaire_id=${questionnaire.id}`}>Ver Perguntas</Link>}
          {questionnaire && can('questionnaires.update') && <Link className="btn btn-primary" to={`/questionnaires/${questionnaire.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {questionnaire && (
        <Card><dl className="row mb-0">
          <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{questionnaire.name || '-'}</dd>
          <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{questionnaire.description || '-'}</dd>
          <dt className="col-sm-3">Perguntas</dt><dd className="col-sm-9">{questionnaire.questions_count ?? 0}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={questionnaire.active ? 'active' : 'inactive'}>{questionnaire.active ? 'Sim' : 'Não'}</StatusBadge></dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(questionnaire.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(questionnaire.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{questionnaire.updated_by_name || '-'}</dd>
        </dl></Card>
      )}
    </section>
  )
}

export default QuestionnairesView
