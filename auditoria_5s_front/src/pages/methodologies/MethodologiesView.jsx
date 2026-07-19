import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'

function MethodologiesView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [methodology, setMethodology] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadMethodology = async () => {
      try {
        const response = await api.get(`/methodologies/${id}`)
        setMethodology(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a metodologia.' })
      } finally {
        setLoading(false)
      }
    }

    loadMethodology()
  }, [id])

  if (loading) {
    return <Loading message="Carregando metodologia..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes da Metodologia"
        description="Informações do cadastro metodológico."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/methodologies">Voltar</Link>
            {methodology && can('methodologies.update') && <Link className="btn btn-primary" to={`/methodologies/${methodology.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {methodology && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Código</dt><dd className="col-sm-9">{methodology.code || '-'}</dd>
            <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{methodology.name || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{methodology.description || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={methodology.active ? 'active' : 'inactive'}>{methodology.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(methodology.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(methodology.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{methodology.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default MethodologiesView

