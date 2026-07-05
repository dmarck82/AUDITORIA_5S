import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import { useAuth } from '../../auth/useAuth'
import { fetchAllPages, getRelatedName } from '../../utils/apiData'

function SectorsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)
  const loadSectors = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) setAlert(null)
    try { setSectors(await fetchAllPages('/sectors')) }
    catch { setAlert({ type: 'danger', message: 'Não foi possível carregar os setores.' }) }
    finally { setLoading(false) }
  }, [location.state?.message])
  useEffect(() => { loadSectors() }, [loadSectors])
  const deleteSector = async (sector) => {
    if (!window.confirm(`Deseja excluir ${sector.name || 'este setor'}?`)) return
    try { await api.delete(`/sectors/${sector.id}`); setAlert({ type: 'success', message: 'Setor excluído com sucesso.' }); setSectors((currentSectors) => currentSectors.filter((item) => item.id !== sector.id)) }
    catch { setAlert({ type: 'danger', message: 'Não foi possível excluir o setor.' }) }
  }

  const columns = [
    { key: 'name', label: 'Nome', render: (sector) => sector.name || '-' },
    {
      key: 'unit',
      label: 'Unidade',
      render: (sector) => getRelatedName(sector, 'unit', 'unit_id'),
      searchValue: (sector) => getRelatedName(sector, 'unit', 'unit_id'),
      sortValue: (sector) => getRelatedName(sector, 'unit', 'unit_id'),
    },
    {
      key: 'active',
      label: 'Ativo',
      render: (sector) => <span className={`badge text-bg-${sector.active ? 'success' : 'secondary'}`}>{sector.active ? 'Sim' : 'Não'}</span>,
      searchValue: (sector) => (sector.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (sector) => (sector.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (sector) => <div className="btn-group btn-group-sm"><Link className="btn btn-outline-secondary" to={`/sectors/${sector.id}`}>Ver</Link>{can('sectors.update') && <Link className="btn btn-outline-primary" to={`/sectors/${sector.id}/edit`}>Editar</Link>}{can('sectors.delete') && <button className="btn btn-outline-danger" type="button" onClick={() => deleteSector(sector)}>Excluir</button>}</div>,
    },
  ]

  return <section><div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"><div><h1 className="h3 mb-1">Setores</h1><p className="text-secondary mb-0">Gerencie áreas avaliáveis.</p></div>{can('sectors.create') && <Link className="btn btn-primary" to="/sectors/create">Novo Setor</Link>}</div><AlertMessage type={alert?.type} message={alert?.message} />{loading ? <Loading message="Carregando setores..." /> : <DataTable columns={columns} rows={sectors} emptyMessage="Nenhum setor encontrado." />}</section>
}

export default SectorsList
