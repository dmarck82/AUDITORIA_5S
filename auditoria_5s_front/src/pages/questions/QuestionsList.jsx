import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'
import { getQuestionCategoryLabel } from './questionCategories'

function QuestionsList() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can } = useAuth()
  const selectedQuestionnaireId = searchParams.get('questionnaire_id') || ''
  const [questions, setQuestions] = useState([])
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      const [loadedQuestionnaires, loadedQuestions] = await Promise.all([
        fetchAllPages('/questionnaires'),
        fetchAllPages('/questions', selectedQuestionnaireId ? { params: { questionnaire_id: selectedQuestionnaireId } } : {}),
      ])

      setQuestionnaires(loadedQuestionnaires)
      setQuestions(loadedQuestions)
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as perguntas.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message, selectedQuestionnaireId])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const selectedQuestionnaire = useMemo(
    () => questionnaires.find((questionnaire) => String(questionnaire.id) === String(selectedQuestionnaireId)),
    [questionnaires, selectedQuestionnaireId],
  )

  const updateQuestionnaireFilter = (event) => {
    const nextQuestionnaireId = event.target.value

    if (nextQuestionnaireId) {
      setSearchParams({ questionnaire_id: nextQuestionnaireId })
    } else {
      setSearchParams({})
    }
  }

  const deleteQuestion = async (question) => {
    if (!window.confirm('Deseja excluir esta pergunta?')) {
      return
    }

    try {
      await api.delete(`/questions/${question.id}`)
      setAlert({ type: 'success', message: 'Pergunta excluída com sucesso.' })
      setQuestions((currentQuestions) => currentQuestions.filter((item) => item.id !== question.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir a pergunta.' })
    }
  }

  const columns = [
    {
      key: 'sort_order',
      label: 'Ordem',
      render: (question) => question.sort_order,
      sortValue: (question) => question.sort_order,
    },
    {
      key: 'questionnaire',
      label: 'Questionário',
      render: (question) => getRelatedName(question, 'questionnaire', 'questionnaire_id'),
      searchValue: (question) => getRelatedName(question, 'questionnaire', 'questionnaire_id'),
      sortValue: (question) => getRelatedName(question, 'questionnaire', 'questionnaire_id'),
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (question) => getQuestionCategoryLabel(question.category),
      searchValue: (question) => `${question.category} ${getQuestionCategoryLabel(question.category)}`,
      sortValue: (question) => getQuestionCategoryLabel(question.category),
    },
    {
      key: 'question',
      label: 'Pergunta',
      render: (question) => question.question || '-',
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (question) => <span className={`badge text-bg-${question.active ? 'success' : 'secondary'}`}>{question.active ? 'Sim' : 'Não'}</span>,
      searchValue: (question) => (question.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (question) => (question.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (question) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/questions/${question.id}`}>Ver</Link>
          {can('questions.update') && <Link className="btn btn-outline-primary" to={`/questions/${question.id}/edit`}>Editar</Link>}
          {can('questions.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteQuestion(question)}>Excluir</button>}
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Perguntas</h1>
          <p className="text-secondary mb-0">Gerencie perguntas dos questionários.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" type="button" disabled>Alterar Ordem</button>
          {can('questions.create') && <Link className="btn btn-primary" to={selectedQuestionnaireId ? `/questions/create?questionnaire_id=${selectedQuestionnaireId}` : '/questions/create'}>Nova Pergunta</Link>}
        </div>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      <div className="row g-3 align-items-end mb-4">
        <div className="col-md-6 col-lg-4">
          <label className="form-label" htmlFor="questionnaire_filter">Questionário</label>
          <select className="form-select" id="questionnaire_filter" value={selectedQuestionnaireId} onChange={updateQuestionnaireFilter}>
            <option value="">Todos</option>
            {questionnaires.map((questionnaire) => (
              <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name}</option>
            ))}
          </select>
        </div>
        {selectedQuestionnaire && <div className="col-md-6 text-secondary pb-2">Exibindo perguntas de {selectedQuestionnaire.name}</div>}
      </div>

      {loading ? (
        <Loading message="Carregando perguntas..." />
      ) : (
        <DataTable columns={columns} rows={questions} emptyMessage="Nenhuma pergunta encontrada." />
      )}
    </section>
  )
}

export default QuestionsList
