import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function getModelLabel(option) {
  const model = option?.evaluation_model
  return [model?.code, model?.name].filter(Boolean).join(' - ') || '-'
}

function EvaluationModelOptionsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [option, setOption] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadOption = async () => {
      try {
        const response = await api.get(`/evaluation-model-options/${id}`)
        setOption(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a opção.' })
      } finally {
        setLoading(false)
      }
    }

    loadOption()
  }, [id])

  if (loading) {
    return <Loading message="Carregando opção..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes da Opção"
        description="Informações da opção do modelo de avaliação."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to={option?.evaluation_model_id ? `/evaluation-models/${option.evaluation_model_id}` : '/evaluation-model-options'}>Voltar</Link>
            {option && can('evaluation_model_options.update') && <Link className="btn btn-primary" to={`/evaluation-model-options/${option.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {option && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Modelo</dt><dd className="col-sm-9">{getModelLabel(option)}</dd>
            <dt className="col-sm-3">Valor</dt><dd className="col-sm-9">{option.value || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{option.description || '-'}</dd>
            <dt className="col-sm-3">Ordem</dt><dd className="col-sm-9">{option.sort_order || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={option.active ? 'active' : 'inactive'}>{option.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(option.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(option.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{option.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default EvaluationModelOptionsView
