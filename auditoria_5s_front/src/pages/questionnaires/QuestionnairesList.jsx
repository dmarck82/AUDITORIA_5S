import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { fetchAllPages } from '../../utils/apiData'

function QuestionnairesList() {
  const location = useLocation()
  const { can } = useAuth()
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadQuestionnaires = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setQuestionnaires(await fetchAllPages('/questionnaires'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os questionários.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadQuestionnaires()
  }, [loadQuestionnaires])

  const deleteQuestionnaire = async (questionnaire) => {
    if (!window.confirm(`Deseja excluir ${questionnaire.name || 'este questionário'}?`)) {
      return
    }

    try {
      await api.delete(`/questionnaires/${questionnaire.id}`)
      setAlert({ type: 'success', message: 'Questionário excluído com sucesso.' })
      setQuestionnaires((currentQuestionnaires) => currentQuestionnaires.filter((item) => item.id !== questionnaire.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir o questionário.' })
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (questionnaire) => questionnaire.name || '-' },
    {
      key: 'questions_count',
      label: 'Perguntas',
      render: (questionnaire) => questionnaire.questions_count ?? 0,
      sortValue: (questionnaire) => questionnaire.questions_count ?? 0,
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (questionnaire) => <span className={`badge text-bg-${questionnaire.active ? 'success' : 'secondary'}`}>{questionnaire.active ? 'Sim' : 'Não'}</span>,
      searchValue: (questionnaire) => (questionnaire.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (questionnaire) => (questionnaire.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (questionnaire) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/questionnaires/${questionnaire.id}`}>Ver</Link>
          <Link className="btn btn-outline-secondary" to={`/questions?questionnaire_id=${questionnaire.id}`}>Ver Perguntas</Link>
          {can('questionnaires.update') && <Link className="btn btn-outline-primary" to={`/questionnaires/${questionnaire.id}/edit`}>Editar</Link>}
          {can('questionnaires.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteQuestionnaire(questionnaire)}>Excluir</button>}
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Questionários</h1>
          <p className="text-secondary mb-0">Gerencie modelos de perguntas para avaliações.</p>
        </div>
        {can('questionnaires.create') && <Link className="btn btn-primary" to="/questionnaires/create">Novo Questionário</Link>}
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando questionários..." />
      ) : (
        <DataTable columns={columns} rows={questionnaires} emptyMessage="Nenhum questionário encontrado." />
      )}
    </section>
  )
}

export default QuestionnairesList
