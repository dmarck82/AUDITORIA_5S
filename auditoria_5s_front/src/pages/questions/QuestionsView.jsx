import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'
import { getQuestionCategoryLabel } from './questionCategories'

function QuestionsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const response = await api.get(`/questions/${id}`)
        setQuestion(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a pergunta.' })
      } finally {
        setLoading(false)
      }
    }

    loadQuestion()
  }, [id])

  if (loading) {
    return <Loading message="Carregando pergunta..." />
  }

  const backPath = question?.questionnaire_id ? `/questions?questionnaire_id=${question.questionnaire_id}` : '/questions'

  return (
    <section>
      <PageHeader
        title="Detalhes da Pergunta"
        description="Informações da pergunta do questionário."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to={backPath}>Voltar</Link>
          {question && can('questions.update') && <Link className="btn btn-primary" to={`/questions/${question.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {question && (
        <Card><dl className="row mb-0">
          <dt className="col-sm-3">Questionário</dt><dd className="col-sm-9">{question.questionnaire?.name || question.questionnaire_id || '-'}</dd>
          <dt className="col-sm-3">Categoria</dt><dd className="col-sm-9">{getQuestionCategoryLabel(question.category)}</dd>
          <dt className="col-sm-3">Ordem</dt><dd className="col-sm-9">{question.sort_order}</dd>
          <dt className="col-sm-3">Pergunta</dt><dd className="col-sm-9">{question.question || '-'}</dd>
          <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{question.description || '-'}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={question.active ? 'active' : 'inactive'}>{question.active ? 'Sim' : 'Não'}</StatusBadge></dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(question.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(question.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{question.updated_by_name || '-'}</dd>
        </dl></Card>
      )}
    </section>
  )
}

export default QuestionsView
