import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { getFiveSSenseLabel } from '../../constants/fiveSSenses'
import { formatDateTime } from '../../utils/formatters'

function VerificationCriteriaView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [criterion, setCriterion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadCriterion = async () => {
      try {
        const response = await api.get(`/verification-criteria/${id}`)
        setCriterion(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o critério de verificação.' })
      } finally {
        setLoading(false)
      }
    }

    loadCriterion()
  }, [id])

  if (loading) return <Loading message="Carregando critério de verificação..." />

  return (
    <section>
      <PageHeader
        title="Detalhes do Critério de Verificação"
        description="Pergunta padrão da metodologia 5S."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/verification-criteria">Voltar</Link>
            {criterion && can('verification_criteria.update') && <Link className="btn btn-primary" to={`/verification-criteria/${criterion.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {criterion && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{criterion.code || '-'}</dd>
            <dt className="col-sm-3">Senso 5S</dt><dd className="col-sm-9">{criterion.sense_label || getFiveSSenseLabel(criterion.sense)}</dd>
            <dt className="col-sm-3">Pergunta</dt><dd className="col-sm-9">{criterion.question || '-'}</dd>
            <dt className="col-sm-3">Opções de resposta</dt>
            <dd className="col-sm-9">
              <ul className="mb-0">
                {(criterion.response_options || []).map((option) => <li key={option.value}><strong>{option.value} pontos:</strong> {option.label}</li>)}
              </ul>
            </dd>
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

export default VerificationCriteriaView
