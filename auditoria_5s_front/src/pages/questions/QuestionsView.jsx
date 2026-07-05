import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
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
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes da Pergunta</h1>
          <p className="text-secondary mb-0">Informações da pergunta do questionário.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to={backPath}>Voltar</Link>
          {question && can('questions.update') && <Link className="btn btn-primary" to={`/questions/${question.id}/edit`}>Editar</Link>}
        </div>
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} />
      {question && (
        <div className="card"><div className="card-body"><dl className="row mb-0">
          <dt className="col-sm-3">Questionário</dt><dd className="col-sm-9">{question.questionnaire?.name || question.questionnaire_id || '-'}</dd>
          <dt className="col-sm-3">Categoria</dt><dd className="col-sm-9">{getQuestionCategoryLabel(question.category)}</dd>
          <dt className="col-sm-3">Ordem</dt><dd className="col-sm-9">{question.sort_order}</dd>
          <dt className="col-sm-3">Pergunta</dt><dd className="col-sm-9">{question.question || '-'}</dd>
          <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{question.description || '-'}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9">{question.active ? 'Sim' : 'Não'}</dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(question.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(question.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{question.updated_by_name || '-'}</dd>
        </dl></div></div>
      )}
    </section>
  )
}

export default QuestionsView
