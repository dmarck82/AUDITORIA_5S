import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { useAuth } from '../../auth/useAuth'
import { ACCESS_LEVEL_OPTIONS, getAccessLevelLabel } from '../../constants/accessLevels'
import { fetchAllPages } from '../../utils/apiData'
import { formatDate } from '../../utils/formatters'

function getPersonLabel(user) {
  return user.person?.name || `ID da pessoa: ${user.person_id}`
}

function getPersonEmail(user) {
  return user.person?.email || '-'
}

function UsersList() {
  const location = useLocation()
  const { can } = useAuth()
  const [users, setUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('active')
  const [accessLevelFilter, setAccessLevelFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setUsers(await fetchAllPages('/users'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os usuários.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const deleteUser = async (user) => {
    if (!window.confirm(`Deseja excluir o usuário ${user.id}?`)) {
      return
    }

    try {
      await api.delete(`/users/${user.id}`)
      setAlert({ type: 'success', message: 'Usuário excluído com sucesso.' })
      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== user.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir o usuário.' })
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (user) => user.id },
    { key: 'person', label: 'Pessoa', render: getPersonLabel, searchValue: getPersonLabel, sortValue: getPersonLabel },
    { key: 'email', label: 'E-mail', render: getPersonEmail, searchValue: getPersonEmail, sortValue: getPersonEmail },
    {
      key: 'access_level',
      label: 'Nível',
      render: (user) => getAccessLevelLabel(user.access_level),
      searchValue: (user) => getAccessLevelLabel(user.access_level),
      sortValue: (user) => getAccessLevelLabel(user.access_level),
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (user) => <span className={`badge text-bg-${user.active ? 'success' : 'secondary'}`}>{user.active ? 'Sim' : 'Não'}</span>,
      searchValue: (user) => (user.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (user) => (user.active ? 'Sim' : 'Não'),
    },
    {
      key: 'updated_by_name',
      label: 'Atualizado por',
      render: (user) => (user.updated_by_name ? `${user.updated_by_name} - ${formatDate(user.updated_at)}` : '-'),
      searchValue: (user) => [user.updated_by_name, formatDate(user.updated_at)].filter(Boolean).join(' '),
      sortValue: (user) => user.updated_by_name || '',
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (user) => (
        <div className="btn-group btn-group-sm">
          <Link className="btn btn-outline-secondary" to={`/users/${user.id}`}>
            Ver
          </Link>
          {can('users.update') && <Link className="btn btn-outline-primary" to={`/users/${user.id}/edit`}>
            Editar
          </Link>}
          {can('users.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteUser(user)}>
            Excluir
          </button>}
        </div>
      ),
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active)
    const matchesAccessLevel =
      accessLevelFilter === 'all' || Number(user.access_level) === Number(accessLevelFilter)

    return matchesStatus && matchesAccessLevel
  })

  return (
    <section>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Usuários</h1>
          <p className="text-secondary mb-0">Gerencie os acessos ao sistema.</p>
        </div>
        {can('users.create') && <Link className="btn btn-primary" to="/users/create">
          Novo Usuário
        </Link>}
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando usuários..." />
      ) : (
        <>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <label className="d-flex align-items-center gap-2 mb-0" htmlFor="users-status-filter">
              <span>Status</span>
              <select
                className="form-select form-select-sm users-status-filter"
                id="users-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="all">Todos</option>
              </select>
            </label>

            <label className="d-flex align-items-center gap-2 mb-0" htmlFor="users-access-level-filter">
              <span>Nível</span>
              <select
                className="form-select form-select-sm users-access-level-filter"
                id="users-access-level-filter"
                value={accessLevelFilter}
                onChange={(event) => setAccessLevelFilter(event.target.value)}
              >
                <option value="all">Todos</option>
                {ACCESS_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <DataTable columns={columns} rows={filteredUsers} emptyMessage="Nenhum usuário encontrado." />
        </>
      )}
    </section>
  )
}

export default UsersList
