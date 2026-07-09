import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
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
      render: (questionnaire) => <StatusBadge status={questionnaire.active ? 'active' : 'inactive'}>{questionnaire.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (questionnaire) => (questionnaire.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (questionnaire) => (questionnaire.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (questionnaire) => (
        <TableActions actions={[
          { label: 'Ver', to: `/questionnaires/${questionnaire.id}`, type: 'view' },
          { label: 'Ver Perguntas', to: `/questions?questionnaire_id=${questionnaire.id}`, type: 'questions' },
          can('questionnaires.update') && { label: 'Editar', to: `/questionnaires/${questionnaire.id}/edit`, type: 'edit' },
          can('questionnaires.delete') && { label: 'Excluir', onClick: () => deleteQuestionnaire(questionnaire), type: 'delete' },
        ]} />
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Questionários"
        description="Gerencie modelos de perguntas para avaliações."
        actions={can('questionnaires.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/questionnaires/create">Novo Questionário</Link>
          </PageActions>
        )}
      />

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
