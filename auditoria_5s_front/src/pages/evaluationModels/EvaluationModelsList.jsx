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

function EvaluationModelsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadModels = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setModels(await fetchAllPages('/evaluation-models'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar os modelos de avaliação.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadModels()
  }, [loadModels])

  const deleteModel = async (model) => {
    if (!window.confirm(`Deseja excluir ${model.name || 'este modelo'}?`)) {
      return
    }

    try {
      await api.delete(`/evaluation-models/${model.id}`)
      setAlert({ type: 'success', message: 'Modelo de avaliação excluído com sucesso.' })
      setModels((currentModels) => currentModels.filter((item) => item.id !== model.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir o modelo de avaliação.' })
    }
  }

  const columns = [
    { key: 'code', label: 'Código', render: (model) => model.code || '-' },
    { key: 'name', label: 'Nome', render: (model) => model.name || '-' },
    {
      key: 'active',
      label: 'Ativo',
      render: (model) => <StatusBadge status={model.active ? 'active' : 'inactive'}>{model.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (model) => (model.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (model) => (model.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (model) => <TableActions actions={[
        { label: 'Ver', to: `/evaluation-models/${model.id}`, type: 'view' },
        can('evaluation_models.update') && { label: 'Editar', to: `/evaluation-models/${model.id}/edit`, type: 'edit' },
        can('evaluation_models.delete') && { label: 'Excluir', onClick: () => deleteModel(model), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Modelos de Avaliação"
        description="Gerencie modelos reutilizáveis de avaliação."
        actions={can('evaluation_models.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/evaluation-models/create">Novo Modelo</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando modelos de avaliação..." />
      ) : (
        <DataTable columns={columns} rows={models} emptyMessage="Nenhum modelo de avaliação encontrado." />
      )}
    </section>
  )
}

export default EvaluationModelsList
