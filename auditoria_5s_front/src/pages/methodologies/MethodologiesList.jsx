import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import DataTable from '../../components/DataTable'
import Loading from '../../components/Loading'
import TableActions from '../../components/TableActions'
import { PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

function MethodologiesList() {
  const location = useLocation()
  const { can } = useAuth()
  const [methodologies, setMethodologies] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadMethodologies = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setMethodologies(await fetchAllPages('/methodologies'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as metodologias.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadMethodologies()
  }, [loadMethodologies])

  const deleteMethodology = async (methodology) => {
    if (!window.confirm(`Deseja excluir ${methodology.name || 'esta metodologia'}?`)) {
      return
    }

    try {
      await api.delete(`/methodologies/${methodology.id}`)
      setAlert({ type: 'success', message: 'Metodologia excluída com sucesso.' })
      setMethodologies((currentMethodologies) => currentMethodologies.filter((item) => item.id !== methodology.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a metodologia.' })
    }
  }

  const columns = [
    { key: 'code', label: 'Código', render: (methodology) => methodology.code || '-' },
    { key: 'name', label: 'Nome', render: (methodology) => methodology.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (methodology) => <StatusBadge status={methodology.active ? 'active' : 'inactive'}>{methodology.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (methodology) => (methodology.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (methodology) => (methodology.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (methodology) => <TableActions actions={[
        { label: 'Ver', to: `/methodologies/${methodology.id}`, type: 'view' },
        can('methodologies.update') && { label: 'Editar', to: `/methodologies/${methodology.id}/edit`, type: 'edit' },
        can('methodologies.delete') && { label: 'Excluir', onClick: () => deleteMethodology(methodology), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Metodologias"
        description="Gerencie metodologias de supervisão."
        actions={can('methodologies.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/methodologies/create">Nova Metodologia</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando metodologias..." />
      ) : (
        <DataTable columns={columns} rows={methodologies} emptyMessage="Nenhuma metodologia encontrada." />
      )}
    </section>
  )
}

export default MethodologiesList

