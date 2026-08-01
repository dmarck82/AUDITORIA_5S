import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../auth/useAuth'
import { ACCESS_LEVEL_OPTIONS, getAccessLevelLabel } from '../../constants/accessLevels'
import { fetchAllPages } from '../../utils/apiData'
import { formatDate } from '../../utils/formatters'

function getUserLabel(operator) {
  return operator.user?.name || `ID do usuário: ${operator.user_id}`
}

function getUserEmail(operator) {
  return operator.user?.email || '-'
}

function OperatorsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [operators, setOperators] = useState([])
  const [statusFilter, setStatusFilter] = useState('active')
  const [accessLevelFilter, setAccessLevelFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadOperators = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setOperators(await fetchAllPages('/operators'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os operadores.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadOperators()
  }, [loadOperators])

  const deleteOperator = async (operator) => {
    if (!window.confirm(`Deseja excluir o operador ${operator.id}?`)) {
      return
    }

    try {
      await api.delete(`/operators/${operator.id}`)
      setAlert({ type: 'success', message: 'Operador excluído com sucesso.' })
      setOperators((currentOperators) => currentOperators.filter((item) => item.id !== operator.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir o operador.' })
    }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (operator) => operator.id },
    { key: 'user', label: 'Usuário', render: getUserLabel, searchValue: getUserLabel, sortValue: getUserLabel },
    { key: 'email', label: 'E-mail', render: getUserEmail, searchValue: getUserEmail, sortValue: getUserEmail },
    {
      key: 'access_level',
      label: 'Nível',
      render: (operator) => getAccessLevelLabel(operator.access_level),
      searchValue: (operator) => getAccessLevelLabel(operator.access_level),
      sortValue: (operator) => getAccessLevelLabel(operator.access_level),
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (operator) => <StatusBadge status={operator.active ? 'active' : 'inactive'}>{operator.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (operator) => (operator.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (operator) => (operator.active ? 'Sim' : 'Não'),
    },
    {
      key: 'updated_by_name',
      label: 'Atualizado por',
      render: (operator) => (operator.updated_by_name ? `${operator.updated_by_name} - ${formatDate(operator.updated_at)}` : '-'),
      searchValue: (operator) => [operator.updated_by_name, formatDate(operator.updated_at)].filter(Boolean).join(' '),
      sortValue: (operator) => operator.updated_by_name || '',
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (operator) => (
        <TableActions actions={[
          { label: 'Ver', to: `/operators/${operator.id}`, type: 'view' },
          can('operators.update') && { label: 'Editar', to: `/operators/${operator.id}/edit`, type: 'edit' },
          can('operators.delete') && { label: 'Excluir', onClick: () => deleteOperator(operator), type: 'delete' },
        ]} />
      ),
    },
  ]

  const filteredOperators = operators.filter((operator) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && operator.active) ||
      (statusFilter === 'inactive' && !operator.active)
    const matchesAccessLevel =
      accessLevelFilter === 'all' || Number(operator.access_level) === Number(accessLevelFilter)

    return matchesStatus && matchesAccessLevel
  })

  return (
    <section>
      <PageHeader
        title="Operadores"
        description="Gerencie os acessos ao sistema."
        actions={can('operators.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/operators/create">Novo Operador</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando operadores..." />
      ) : (
        <>
          <Card className="mb-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <label className="d-flex align-items-center gap-2 mb-0" htmlFor="operators-status-filter">
              <span>Status</span>
              <select
                className="form-select form-select-sm operators-status-filter"
                id="operators-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="all">Todos</option>
              </select>
            </label>

            <label className="d-flex align-items-center gap-2 mb-0" htmlFor="operators-access-level-filter">
              <span>Nível</span>
              <select
                className="form-select form-select-sm operators-access-level-filter"
                id="operators-access-level-filter"
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
          </Card>

          <DataTable columns={columns} rows={filteredOperators} emptyMessage="Nenhum operador encontrado." />
        </>
      )}
    </section>
  )
}

export default OperatorsList
