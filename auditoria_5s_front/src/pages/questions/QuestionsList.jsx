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
import { getQuestionCategoryLabel } from './questionCategories'

function QuestionsList() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { can } = useAuth()
  const selectedQuestionnaireId = searchParams.get('questionnaire_id') || ''
  const [questions, setQuestions] = useState([])
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderedQuestions, setReorderedQuestions] = useState([])
  const [draggedQuestionId, setDraggedQuestionId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
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
      setReorderedQuestions([...loadedQuestions].sort((first, second) => Number(first.sort_order) - Number(second.sort_order)))
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
    setReorderMode(false)
    setDraggedQuestionId(null)

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

  const moveQuestion = (sourceQuestionId, targetQuestionId) => {
    if (!sourceQuestionId || sourceQuestionId === targetQuestionId) {
      return
    }

    setReorderedQuestions((currentQuestions) => {
      const sourceIndex = currentQuestions.findIndex((question) => question.id === sourceQuestionId)
      const targetIndex = currentQuestions.findIndex((question) => question.id === targetQuestionId)

      if (sourceIndex < 0 || targetIndex < 0) {
        return currentQuestions
      }

      const nextQuestions = [...currentQuestions]
      const [movedQuestion] = nextQuestions.splice(sourceIndex, 1)
      nextQuestions.splice(targetIndex, 0, movedQuestion)

      return nextQuestions
    })
  }

  const startReorder = () => {
    if (!selectedQuestionnaireId) {
      setAlert({ type: 'warning', message: 'Selecione um questionário antes de alterar a ordem das perguntas.' })
      return
    }

    setAlert(null)
    setReorderedQuestions([...questions].sort((first, second) => Number(first.sort_order) - Number(second.sort_order)))
    setReorderMode(true)
  }

  const finishReorder = async () => {
    setSavingOrder(true)
    setAlert(null)

    try {
      await api.post('/questions/reorder', {
        questionnaire_id: Number(selectedQuestionnaireId),
        questions: reorderedQuestions.map((question) => question.id),
      })
      setAlert({ type: 'success', message: 'Ordem das perguntas atualizada com sucesso.' })
      setReorderMode(false)
      setDraggedQuestionId(null)
      await loadQuestions()
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message === 'All questionnaire questions must be sent to reorder.'
          ? 'Todas as perguntas do questionário devem ser enviadas para alterar a ordem.'
          : 'Não foi possível atualizar a ordem das perguntas.',
      })
    } finally {
      setSavingOrder(false)
    }
  }

  const toggleReorder = () => {
    if (reorderMode) {
      finishReorder()
      return
    }

    startReorder()
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
      render: (question) => <StatusBadge status={question.active ? 'active' : 'inactive'}>{question.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (question) => (question.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (question) => (question.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (question) => (
        <TableActions actions={[
          { label: 'Ver', to: `/questions/${question.id}`, type: 'view' },
          can('questions.update') && { label: 'Editar', to: `/questions/${question.id}/edit`, type: 'edit' },
          can('questions.delete') && { label: 'Excluir', onClick: () => deleteQuestion(question), type: 'delete' },
        ]} />
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Perguntas"
        description="Gerencie perguntas dos questionários."
        actions={(
          <PageActions>
          {can('questions.update') && (
            <button className={`btn ${reorderMode ? 'btn-success' : 'btn-outline-secondary'}`} type="button" disabled={savingOrder || loading} onClick={toggleReorder}>
              {savingOrder ? 'Salvando...' : reorderMode ? 'Concluir' : 'Alterar Ordem'}
            </button>
          )}
          {can('questions.create') && !reorderMode && <Link className="btn btn-primary" to={selectedQuestionnaireId ? `/questions/create?questionnaire_id=${selectedQuestionnaireId}` : '/questions/create'}>Nova Pergunta</Link>}
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      <Card className="mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-md-6 col-lg-4">
          <label className="form-label" htmlFor="questionnaire_filter">Questionário</label>
          <select className="form-select" disabled={reorderMode} id="questionnaire_filter" value={selectedQuestionnaireId} onChange={updateQuestionnaireFilter}>
            <option value="">Todos</option>
            {questionnaires.map((questionnaire) => (
              <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name}</option>
            ))}
          </select>
        </div>
        {selectedQuestionnaire && <div className="col-md-6 text-secondary pb-2">Exibindo perguntas de {selectedQuestionnaire.name}</div>}
      </div>
      </Card>

      {loading ? (
        <Loading message="Carregando perguntas..." />
      ) : reorderMode ? (
        <Card>
          <div className="alert alert-info">
            Arraste uma pergunta para reposicioná-la. Clique em <strong>Concluir</strong> para salvar a nova ordem.
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '72px' }}>Mover</th>
                  <th className="text-center" style={{ width: '100px' }}>Ordem</th>
                  <th className="text-center">Categoria</th>
                  <th className="text-center">Pergunta</th>
                  <th className="text-center" style={{ width: '100px' }}>Ativo</th>
                </tr>
              </thead>
              <tbody>
                {reorderedQuestions.map((question, index) => (
                  <tr
                    draggable
                    className={draggedQuestionId === question.id ? 'table-primary' : ''}
                    key={question.id}
                    style={{ cursor: 'grab' }}
                    onDragEnd={() => setDraggedQuestionId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDragStart={() => setDraggedQuestionId(question.id)}
                    onDrop={() => moveQuestion(draggedQuestionId, question.id)}
                  >
                    <td className="text-center text-secondary">
                      <i className="bi bi-grip-vertical" aria-hidden="true" />
                      <span className="visually-hidden">Arrastar pergunta</span>
                    </td>
                    <td>{index + 1}</td>
                    <td>{getQuestionCategoryLabel(question.category)}</td>
                    <td>{question.question || '-'}</td>
                    <td>
                      <StatusBadge status={question.active ? 'active' : 'inactive'}>{question.active ? 'Sim' : 'Não'}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <DataTable columns={columns} rows={questions} emptyMessage="Nenhuma pergunta encontrada." />
      )}
    </section>
  )
}

export default QuestionsList
