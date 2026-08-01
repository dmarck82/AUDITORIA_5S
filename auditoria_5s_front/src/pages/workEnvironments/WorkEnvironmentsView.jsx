import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function WorkEnvironmentsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [workEnvironment, setWorkEnvironment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadWorkEnvironment = async () => {
      try {
        const response = await api.get(`/work-environments/${id}`)
        setWorkEnvironment(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o ambiente de trabalho.' })
      } finally {
        setLoading(false)
      }
    }

    loadWorkEnvironment()
  }, [id])

  if (loading) return <Loading message="Carregando ambiente de trabalho..." />

  const local3 = workEnvironment?.local3
  const local2 = local3?.local2

  return (
    <section>
      <PageHeader
        title="Detalhes do Ambiente de Trabalho"
        description="Informações do local supervisionável."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/work-environments">Voltar</Link>
            {workEnvironment && <Link className="btn btn-outline-primary" to={`/work-environments/${workEnvironment.id}/criteria`}>Critérios de Verificação</Link>}
            {workEnvironment && can('work_environments.update') && <Link className="btn btn-primary" to={`/work-environments/${workEnvironment.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {workEnvironment && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{workEnvironment.name || '-'}</dd>
            <dt className="col-sm-3">Organização</dt><dd className="col-sm-9">{local2?.local_1_name || '-'}</dd>
            <dt className="col-sm-3">Setor/OMDS</dt><dd className="col-sm-9">{local2?.name || '-'}</dd>
            <dt className="col-sm-3">Subsetor/Seção</dt><dd className="col-sm-9">{local3?.name || workEnvironment.local_3_id || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{workEnvironment.description || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={workEnvironment.active ? 'active' : 'inactive'}>{workEnvironment.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Critérios vinculados</dt><dd className="col-sm-9">{workEnvironment.active_verification_criteria_count ?? 0} ativos de {workEnvironment.verification_criteria_count ?? 0}</dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(workEnvironment.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(workEnvironment.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{workEnvironment.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default WorkEnvironmentsView
