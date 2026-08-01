import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../auth/useAuth'
import { getAccessLevelLabel } from '../../constants/accessLevels'
import { formatDateTime } from '../../utils/formatters'

function OperatorsView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadOperator = async () => {
      try {
        const response = await api.get(`/operators/${id}`)
        setOperator(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o operador.' })
      } finally {
        setLoading(false)
      }
    }

    loadOperator()
  }, [id])

  if (loading) {
    return <Loading message="Carregando operador..." />
  }

  return (
    <section>
      <PageHeader
        title="Detalhes do Operador"
        description="Informações de acesso."
        actions={(
          <PageActions>
          <Link className="btn btn-outline-secondary" to="/operators">
            Voltar
          </Link>
          {operator && can('operators.update') && (
            <Link className="btn btn-primary" to={`/operators/${operator.id}/edit`}>
              Editar
            </Link>
          )}
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {operator && (
        <Card>
            <dl className="row mb-0">
              <dt className="col-sm-3">ID</dt>
              <dd className="col-sm-9">{operator.id}</dd>
              <dt className="col-sm-3">Usuário</dt>
              <dd className="col-sm-9">{operator.user_id || '-'}</dd>
              <dt className="col-sm-3">Nível de acesso</dt>
              <dd className="col-sm-9">{getAccessLevelLabel(operator.access_level)}</dd>
              <dt className="col-sm-3">Ativo</dt>
              <dd className="col-sm-9"><StatusBadge status={operator.active ? 'active' : 'inactive'}>{operator.active ? 'Sim' : 'Não'}</StatusBadge></dd>
              <dt className="col-sm-3">Criado em</dt>
              <dd className="col-sm-9">{formatDateTime(operator.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt>
              <dd className="col-sm-9">{formatDateTime(operator.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt>
              <dd className="col-sm-9">{operator.updated_by_name || '-'}</dd>
            </dl>

            {operator.user && (
              <>
                <hr />
                <h2 className="h5">Usuário vinculado</h2>
                <dl className="row mb-0">
                  <dt className="col-sm-3">Nome</dt>
                  <dd className="col-sm-9">{operator.user.name || '-'}</dd>
                  <dt className="col-sm-3">E-mail</dt>
                  <dd className="col-sm-9">{operator.user.email || '-'}</dd>
                  <dt className="col-sm-3">Celular</dt>
                  <dd className="col-sm-9">{operator.user.phone || '-'}</dd>
                  <dt className="col-sm-3">Cargo</dt>
                  <dd className="col-sm-9">{operator.user.job_title || '-'}</dd>
                </dl>
              </>
            )}
        </Card>
      )}
    </section>
  )
}

export default OperatorsView
