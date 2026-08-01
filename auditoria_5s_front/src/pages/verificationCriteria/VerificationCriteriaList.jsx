import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { getFiveSSenseLabel } from '../../constants/fiveSSenses'
import { fetchAllPages } from '../../utils/apiData'

function VerificationCriteriaList() {
  const location = useLocation()
  const { can } = useAuth()
  const [criteria, setCriteria] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadCriteria = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) setAlert(null)

    try {
      setCriteria(await fetchAllPages('/verification-criteria'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os critérios de verificação.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => { loadCriteria() }, [loadCriteria])

  const deleteCriterion = async (criterion) => {
    if (!window.confirm(`Deseja excluir o critério ${criterion.code || ''}?`)) return

    try {
      await api.delete(`/verification-criteria/${criterion.id}`)
      setAlert({ type: 'success', message: 'Critério de Verificação excluído com sucesso.' })
      setCriteria((current) => current.filter((item) => item.id !== criterion.id))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível excluir o critério de verificação.' })
    }
  }

  const columns = [
    { key: 'code', label: 'Código', render: (criterion) => criterion.code || '-' },
    {
      key: 'sense',
      label: 'Senso 5S',
      render: (criterion) => criterion.sense_label || getFiveSSenseLabel(criterion.sense),
      searchValue: (criterion) => criterion.sense_label || getFiveSSenseLabel(criterion.sense),
      sortValue: (criterion) => criterion.sense_label || getFiveSSenseLabel(criterion.sense),
    },
    { key: 'question', label: 'Pergunta', render: (criterion) => criterion.question || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (criterion) => <StatusBadge status={criterion.active ? 'active' : 'inactive'}>{criterion.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (criterion) => (criterion.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (criterion) => (criterion.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (criterion) => <TableActions actions={[
        { label: 'Ver', to: `/verification-criteria/${criterion.id}`, type: 'view' },
        can('verification_criteria.update') && { label: 'Editar', to: `/verification-criteria/${criterion.id}/edit`, type: 'edit' },
        can('verification_criteria.delete') && { label: 'Excluir', onClick: () => deleteCriterion(criterion), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Critérios de Verificação"
        description="Gerencie as perguntas padrão da metodologia 5S."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/cadastros"><i className="bi bi-arrow-left" aria-hidden="true" /> Voltar aos Cadastros</Link>
            {can('verification_criteria.create') && <Link className="btn btn-primary" to="/verification-criteria/create">Novo Critério de Verificação</Link>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} />
      {loading ? <Loading message="Carregando critérios de verificação..." /> : <DataTable columns={columns} rows={criteria} emptyMessage="Nenhum critério de verificação encontrado." />}
    </section>
  )
}

export default VerificationCriteriaList
