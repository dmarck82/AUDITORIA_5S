import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'
import { useAuth } from '../../auth/useAuth'

function Local1sList() {
  const location = useLocation()
  const { can } = useAuth()
  const [local1s, setLocal1s] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadLocal1s = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setLocal1s(await fetchAllPages('/local1s'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as organizações.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadLocal1s()
  }, [loadLocal1s])

  const deleteLocal1 = async (local1) => {
    if (!window.confirm(`Deseja excluir ${local1.name || 'esta organização'}?`)) {
      return
    }

    try {
      await api.delete(`/local1s/${local1.id}`)
      setAlert({ type: 'success', message: 'Organização excluída com sucesso.' })
      setLocal1s((currentLocal1s) => currentLocal1s.filter((item) => item.id !== local1.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir a organização.' })
    }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (local1) => local1.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (local1) => <StatusBadge status={local1.active ? 'active' : 'inactive'}>{local1.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (local1) => (local1.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (local1) => (local1.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (local1) => (
        <TableActions actions={[
          { label: 'Ver', to: `/local1s/${local1.id}`, type: 'view' },
          can('local1s.update') && { label: 'Editar', to: `/local1s/${local1.id}/edit`, type: 'edit' },
          can('local1s.delete') && { label: 'Excluir', onClick: () => deleteLocal1(local1), type: 'delete' },
        ]} />
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Organizações"
        description="Gerencie empresas cadastradas."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/cadastros"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos Cadastros</Link>
            {can('local1s.create') && <Link className="btn btn-primary" to="/local1s/create">Nova Organização</Link>}
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando organizações..." />
      ) : (
        <DataTable centered columns={columns} rows={local1s} emptyMessage="Nenhuma organização encontrada." />
      )}
    </section>
  )
}

export default Local1sList
