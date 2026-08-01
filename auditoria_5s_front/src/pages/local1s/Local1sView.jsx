import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/formatters'

function Local1sView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [local1, setLocal1] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadLocal1 = async () => {
      try {
        const response = await api.get(`/local1s/${id}`)
        setLocal1(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a organização.' })
      } finally {
        setLoading(false)
      }
    }

    loadLocal1()
  }, [id])

  if (loading) {
    return <Loading message="Carregando organização..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes da Organização"
        description="Informações da organização."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/local1s">Voltar</Link>
          {local1 && can('local1s.update') && <Link className="btn btn-primary" to={`/local1s/${local1.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {local1 && (
        <Card><dl className="row mb-0">
          <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{local1.name || '-'}</dd>
          <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={local1.active ? 'active' : 'inactive'}>{local1.active ? 'Sim' : 'Não'}</StatusBadge></dd>
          <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(local1.created_at)}</dd>
          <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(local1.updated_at)}</dd>
          <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{local1.updated_by_name || '-'}</dd>
        </dl></Card>
      )}
    </section>
  )
}

export default Local1sView
