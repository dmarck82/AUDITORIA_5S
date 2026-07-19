import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function getDimensionLabel(criterion) {
  const dimension = criterion?.evaluation_dimension
  const methodology = [dimension?.methodology_code, dimension?.methodology_name].filter(Boolean).join(' - ')
  const dimensionLabel = [dimension?.code, dimension?.name].filter(Boolean).join(' - ')
  return [methodology, dimensionLabel].filter(Boolean).join(' / ') || '-'
}

function getModelLabel(criterion) {
  const model = criterion?.evaluation_model
  return [model?.code, model?.name].filter(Boolean).join(' - ') || '-'
}

function CriteriaView() {
  const { id } = useParams()
  const location = useLocation()
  const { can } = useAuth()
  const [criterion, setCriterion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  useEffect(() => {
    const loadCriterion = async () => {
      try {
        const response = await api.get(`/criteria/${id}`)
        setCriterion(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o critério.' })
      } finally {
        setLoading(false)
      }
    }

    loadCriterion()
  }, [id])

  if (loading) {
    return <Loading message="Carregando critério..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Critério"
        description="Informações do critério universal."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/criteria">Voltar</Link>
            {criterion && can('criteria.update') && <Link className="btn btn-primary" to={`/criteria/${criterion.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {criterion && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{criterion.code || '-'}</dd>
            <dt className="col-sm-3">Texto universal</dt><dd className="col-sm-9">{criterion.text || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{criterion.description || '-'}</dd>
            <dt className="col-sm-3">Dimensão</dt><dd className="col-sm-9">{getDimensionLabel(criterion)}</dd>
            <dt className="col-sm-3">Modelo</dt><dd className="col-sm-9">{getModelLabel(criterion)}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={criterion.active ? 'active' : 'inactive'}>{criterion.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(criterion.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(criterion.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{criterion.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default CriteriaView
