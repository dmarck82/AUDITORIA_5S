import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { useAuth } from '../../auth/useAuth'
import { getAccessLevelLabel } from '../../constants/accessLevels'
import { formatDateTime } from '../../utils/formatters'

function UsersView() {
  const { id } = useParams()
  const { can } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get(`/users/${id}`)
        setUser(response.data.data || response.data)
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o usuário.' })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [id])

  if (loading) {
    return <Loading message="Carregando usuário..." />
  }

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Detalhes do Usuário</h1>
          <p className="text-secondary mb-0">Informações de acesso.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/users">
            Voltar
          </Link>
          {user && can('users.update') && (
            <Link className="btn btn-primary" to={`/users/${user.id}/edit`}>
              Editar
            </Link>
          )}
        </div>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {user && (
        <div className="card">
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-sm-3">ID</dt>
              <dd className="col-sm-9">{user.id}</dd>
              <dt className="col-sm-3">Pessoa</dt>
              <dd className="col-sm-9">{user.person_id || '-'}</dd>
              <dt className="col-sm-3">Nível de acesso</dt>
              <dd className="col-sm-9">{getAccessLevelLabel(user.access_level)}</dd>
              <dt className="col-sm-3">Ativo</dt>
              <dd className="col-sm-9">{user.active ? 'Sim' : 'Não'}</dd>
              <dt className="col-sm-3">Criado em</dt>
              <dd className="col-sm-9">{formatDateTime(user.created_at)}</dd>
              <dt className="col-sm-3">Atualizado em</dt>
              <dd className="col-sm-9">{formatDateTime(user.updated_at)}</dd>
              <dt className="col-sm-3">Atualizado por</dt>
              <dd className="col-sm-9">{user.updated_by_name || '-'}</dd>
            </dl>

            {user.person && (
              <>
                <hr />
                <h2 className="h5">Pessoa Vinculada</h2>
                <dl className="row mb-0">
                  <dt className="col-sm-3">Nome</dt>
                  <dd className="col-sm-9">{user.person.name || '-'}</dd>
                  <dt className="col-sm-3">E-mail</dt>
                  <dd className="col-sm-9">{user.person.email || '-'}</dd>
                  <dt className="col-sm-3">Celular</dt>
                  <dd className="col-sm-9">{user.person.phone || '-'}</dd>
                  <dt className="col-sm-3">Cargo</dt>
                  <dd className="col-sm-9">{user.person.job_title || '-'}</dd>
                </dl>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default UsersView
