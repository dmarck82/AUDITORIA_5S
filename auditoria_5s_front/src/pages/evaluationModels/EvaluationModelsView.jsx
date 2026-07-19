import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function EvaluationModelsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadModel = async () => {
      try {
        const response = await api.get(`/evaluation-models/${id}`)
        setModel(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o modelo de avaliação.' })
      } finally {
        setLoading(false)
      }
    }

    loadModel()
  }, [id])

  if (loading) {
    return <Loading message="Carregando modelo de avaliação..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Modelo de Avaliação"
        description="Informações do modelo reutilizável."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/evaluation-models">Voltar</Link>
            {model && can('evaluation_models.update') && <Link className="btn btn-primary" to={`/evaluation-models/${model.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {model && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{model.code || '-'}</dd>
            <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{model.name || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{model.description || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={model.active ? 'active' : 'inactive'}>{model.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(model.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(model.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{model.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default EvaluationModelsView
