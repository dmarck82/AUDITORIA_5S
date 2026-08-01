import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/formatters'

function Local3sView() {
  const { id } = useParams(); const [local3, setLocal3] = useState(null); const [loading, setLoading] = useState(true); const [alert, setAlert] = useState(null)
  const { can } = useAuth()
  useEffect(() => { const loadLocal3 = async () => { try { const response = await api.get(`/local3s/${id}`); setLocal3(response.data.data || response.data) } catch { setAlert({ type: 'danger', message: 'Não foi possível carregar o subsetor/seção.' }) } finally { setLoading(false) } }; loadLocal3() }, [id])
  if (loading) return <Loading message="Carregando subsetor/seção..." />

  return (
    <section>
      <PageHeader
        title="Detalhes do Subsetor/Seção"
        description="Informações da área."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/local3s">Voltar</Link>
            {local3 && can('local3s.update') && <Link className="btn btn-primary" to={`/local3s/${local3.id}/edit`}>Editar</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {local3 && (
        <Card>
          <dl className="row mb-0">
            <dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{local3.name || '-'}</dd>
            <dt className="col-sm-3">Setor/OMDS</dt><dd className="col-sm-9">{local3.local2?.name || local3.local_2_id || '-'}</dd>
            <dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{local3.description || '-'}</dd>
            <dt className="col-sm-3">Ativo</dt><dd className="col-sm-9"><StatusBadge status={local3.active ? 'active' : 'inactive'}>{local3.active ? 'Sim' : 'Não'}</StatusBadge></dd>
            <dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(local3.created_at)}</dd>
            <dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(local3.updated_at)}</dd>
            <dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{local3.updated_by_name || '-'}</dd>
          </dl>
        </Card>
      )}
    </section>
  )
}

export default Local3sView
