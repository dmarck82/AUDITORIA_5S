import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function getMethodologyLabel(dimension) {
  const methodology = dimension?.methodology
  return [methodology?.code, methodology?.name].filter(Boolean).join(' - ') || '-'
}

function EvaluationDimensionsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [dimension, setDimension] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadDimension = async () => {
      try {
        const response = await api.get(`/evaluation-dimensions/${id}`)
        setDimension(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a dimensão.' })
      } finally {
        setLoading(false)
      }
    }

    loadDimension()
  }, [id])

  if (loading) {
    return <Loading message="Carregando dimensão..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes da Dimensão"
        description="Informações da dimensão de avaliação."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to={dimension?.methodology_id ? `/methodologies/${dimension.methodology_id}` : '/evaluation-dimensions'}>Voltar</Link>
            {dimension && can('evaluation_dimensions.update') && <Link className="btn btn-primary" to={`/evaluation-dimensions/${dimension.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {dimension && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Metodologia</dt><dd className="col-sm-9">{getMethodologyLabel(dimension)}</dd>
            <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{dimension.code || '-'}</dd>
            <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{dimension.name || '-'}</dd>
            <dt className="col-sm-3">Objetivo</dt><dd className="col-sm-9">{dimension.objective || '-'}</dd>
            <dt className="col-sm-3">Ordem</dt><dd className="col-sm-9">{dimension.sort_order || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={dimension.active ? 'active' : 'inactive'}>{dimension.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(dimension.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(dimension.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{dimension.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default EvaluationDimensionsView
