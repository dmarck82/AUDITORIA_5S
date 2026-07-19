import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = {
  evaluation_model_id: '',
  value: '',
  description: '',
  sort_order: 1,
  active: true,
}

function EvaluationModelOptionsForm() {
  const { id, modelId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState({ ...emptyForm, evaluation_model_id: modelId || '' })
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const loadedModels = await fetchAllPages('/evaluation-models')
        setModels(loadedModels.filter((model) => model.active))

        if (isEditing) {
          const response = await api.get(`/evaluation-model-options/${id}`)
          const option = response.data.data || response.data
          setForm({
            evaluation_model_id: String(option.evaluation_model_id || ''),
            value: option.value || '',
            description: option.description || '',
            sort_order: option.sort_order || 1,
            active: Boolean(option.active),
          })
        } else if (modelId) {
          setForm((currentForm) => ({ ...currentForm, evaluation_model_id: String(modelId) }))
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados da opção.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing, modelId])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    const payload = {
      ...form,
      evaluation_model_id: Number(form.evaluation_model_id),
      value: form.value.trim(),
      description: form.description || null,
      sort_order: Number(form.sort_order),
    }

    try {
      const response = isEditing
        ? await api.put(`/evaluation-model-options/${id}`, payload)
        : await api.post('/evaluation-model-options', payload)
      const option = response.data.data || response.data
      const targetModelId = modelId || option.evaluation_model_id || form.evaluation_model_id

      navigate(`/evaluation-models/${targetModelId}`, { state: { message: `Opção ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a opção.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando opção..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Opção' : 'Nova Opção'} description="Preencha os dados da opção do modelo." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="evaluation_model_id">Modelo de Avaliação</label>
            <select className="form-select" id="evaluation_model_id" name="evaluation_model_id" value={form.evaluation_model_id} onChange={updateField} required>
              <option value="">Selecione</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.code} - {model.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="value">Valor</label>
            <input className="form-control" id="value" maxLength="80" name="value" value={form.value} onChange={updateField} required />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="sort_order">Ordem</label>
            <input className="form-control" id="sort_order" min="1" name="sort_order" type="number" value={form.sort_order} onChange={updateField} required />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">Descrição</label>
            <textarea className="form-control" id="description" name="description" value={form.description} onChange={updateField} rows="4" />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
              <label className="form-check-label" htmlFor="active">Ativo</label>
            </div>
          </div>
          <FormActions>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <Link className="btn btn-outline-secondary" to={modelId ? `/evaluation-models/${modelId}` : '/evaluation-model-options'}>Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default EvaluationModelOptionsForm
