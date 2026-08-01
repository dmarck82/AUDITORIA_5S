import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { useAuth } from '../../auth/useAuth'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'

function Local3sList() {
  const location = useLocation()
  const { can } = useAuth()
  const [local3s, setLocal3s] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)
  const loadLocal3s = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) setAlert(null)
    try { setLocal3s(await fetchAllPages('/local3s')) }
    catch { setAlert({ type: 'danger', message: 'Não foi possível carregar os subsetores/seções.' }) }
    finally { setLoading(false) }
  }, [location.state?.message])
  useEffect(() => { loadLocal3s() }, [loadLocal3s])
  const deleteLocal3 = async (local3) => {
    if (!window.confirm(`Deseja excluir ${local3.name || 'este subsetor/seção'}?`)) return
    try { await api.delete(`/local3s/${local3.id}`); setAlert({ type: 'success', message: 'Subsetor/Seção excluído com sucesso.' }); setLocal3s((currentLocal3s) => currentLocal3s.filter((item) => item.id !== local3.id)) }
    catch { setAlert({ type: 'danger', message: 'Não foi possível excluir o subsetor/seção.' }) }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (local3) => local3.name || '-' },
    {
      key: 'local2',
      label: 'Setor/OMDS',
      render: (local3) => getRelatedName(local3, 'local2', 'local_2_id'),
      searchValue: (local3) => getRelatedName(local3, 'local2', 'local_2_id'),
      sortValue: (local3) => getRelatedName(local3, 'local2', 'local_2_id'),
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (local3) => <StatusBadge status={local3.active ? 'active' : 'inactive'}>{local3.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (local3) => (local3.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (local3) => (local3.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (local3) => <TableActions actions={[
        { label: 'Ver', to: `/local3s/${local3.id}`, type: 'view' },
        can('local3s.update') && { label: 'Editar', to: `/local3s/${local3.id}/edit`, type: 'edit' },
        can('local3s.delete') && { label: 'Excluir', onClick: () => deleteLocal3(local3), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Subsetor/Seção"
        description="Gerencie áreas avaliáveis."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/cadastros"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos Cadastros</Link>
            {can('local3s.create') && <Link className="btn btn-primary" to="/local3s/create">Novo Subsetor/Seção</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? <Loading message="Carregando subsetores/seções..." /> : <DataTable centered columns={columns} rows={local3s} emptyMessage="Nenhum subsetor/seção encontrado." />}
    </section>
  )
}

export default Local3sList
