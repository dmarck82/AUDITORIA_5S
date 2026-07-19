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

function getModelLabel(option) {
  return [option.evaluation_model_code, option.evaluation_model_name].filter(Boolean).join(' - ') || '-'
}

function EvaluationModelOptionsList() {
  const location = useLocation()
  const { can } = useAuth()
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  const loadOptions = useCallback(async () => {
    setLoading(true)
    if (!location.state?.message) {
      setAlert(null)
    }

    try {
      setOptions(await fetchAllPages('/evaluation-model-options'))
    } catch {
      setAlert({ type: 'danger', message: 'Não foi possível carregar as opções dos modelos.' })
    } finally {
      setLoading(false)
    }
  }, [location.state?.message])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const deleteOption = async (option) => {
    if (!window.confirm(`Deseja excluir ${option.value || 'esta opção'}?`)) {
      return
    }

    try {
      await api.delete(`/evaluation-model-options/${option.id}`)
      setAlert({ type: 'success', message: 'Opção excluída com sucesso.' })
      setOptions((currentOptions) => currentOptions.filter((item) => item.id !== option.id))
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível excluir a opção.' })
    }
  }

  const columns = [
    { key: 'sort_order', label: 'Ordem', render: (option) => option.sort_order || '-', sortValue: (option) => option.sort_order || 0 },
    { key: 'value', label: 'Valor', render: (option) => option.value || '-' },
    { key: 'description', label: 'Descrição', render: (option) => option.description || '-' },
    { key: 'model', label: 'Modelo', render: getModelLabel, searchValue: getModelLabel, sortValue: getModelLabel },
    {
      key: 'active',
      label: 'Ativo',
      render: (option) => <StatusBadge status={option.active ? 'active' : 'inactive'}>{option.active ? 'Sim' : 'Não'}</StatusBadge>,
      searchValue: (option) => (option.active ? 'Sim Ativo' : 'Não Inativo'),
      sortValue: (option) => (option.active ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-end',
      sortable: false,
      render: (option) => <TableActions actions={[
        { label: 'Ver', to: `/evaluation-model-options/${option.id}`, type: 'view' },
        can('evaluation_model_options.update') && { label: 'Editar', to: `/evaluation-model-options/${option.id}/edit`, type: 'edit' },
        can('evaluation_model_options.delete') && { label: 'Excluir', onClick: () => deleteOption(option), type: 'delete' },
      ]} />,
    },
  ]

  return (
    <section>
      <PageHeader
        title="Opções dos Modelos"
        description="Gerencie valores e condições de atendimento dos modelos."
        actions={can('evaluation_model_options.create') && (
          <PageActions>
            <Link className="btn btn-primary" to="/evaluation-model-options/create">Nova Opção</Link>
          </PageActions>
        )}
      />

      <AlertMessage type={alert?.type} message={alert?.message} />

      {loading ? (
        <Loading message="Carregando opções..." />
      ) : (
        <DataTable columns={columns} rows={options} emptyMessage="Nenhuma opção encontrada." />
      )}
    </section>
  )
}

export default EvaluationModelOptionsList
