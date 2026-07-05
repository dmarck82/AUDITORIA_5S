import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { useAuth } from '../../auth/useAuth'
import { formatDateTime } from '../../utils/formatters'

function SectorsView() {
  const { id } = useParams(); const [sector, setSector] = useState(null); const [loading, setLoading] = useState(true); const [alert, setAlert] = useState(null)
  const { can } = useAuth()
  useEffect(() => { const loadSector = async () => { try { const response = await api.get(`/sectors/${id}`); setSector(response.data.data || response.data) } catch { setAlert({ type: 'danger', message: 'Não foi possível carregar o setor.' }) } finally { setLoading(false) } }; loadSector() }, [id])
  if (loading) return <Loading message="Carregando setor..." />
  return <section><div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"><div><h1 className="h3 mb-1">Detalhes do Setor</h1><p className="text-secondary mb-0">Informações da área.</p></div><div className="d-flex gap-2"><Link className="btn btn-outline-secondary" to="/sectors">Voltar</Link>{sector && can('sectors.update') && <Link className="btn btn-primary" to={`/sectors/${sector.id}/edit`}>Editar</Link>}</div></div><AlertMessage type={alert?.type} message={alert?.message} />{sector && <div className="card"><div className="card-body"><dl className="row mb-0"><dt className="col-sm-3">Nome</dt><dd className="col-sm-9">{sector.name || '-'}</dd><dt className="col-sm-3">Unidade</dt><dd className="col-sm-9">{sector.unit?.name || sector.unit_id || '-'}</dd><dt className="col-sm-3">Descrição</dt><dd className="col-sm-9">{sector.description || '-'}</dd><dt className="col-sm-3">Ativo</dt><dd className="col-sm-9">{sector.active ? 'Sim' : 'Não'}</dd><dt className="col-sm-3">Criado em</dt><dd className="col-sm-9">{formatDateTime(sector.created_at)}</dd><dt className="col-sm-3">Atualizado em</dt><dd className="col-sm-9">{formatDateTime(sector.updated_at)}</dd><dt className="col-sm-3">Atualizado por</dt><dd className="col-sm-9">{sector.updated_by_name || '-'}</dd></dl></div></div>}</section>
}

export default SectorsView
