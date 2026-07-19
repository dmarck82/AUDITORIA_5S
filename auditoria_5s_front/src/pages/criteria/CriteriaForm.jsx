import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = {
  evaluation_dimension_id: '',
  evaluation_model_id: '',
  code: '',
  text: '',
  description: '',
  active: true,
}

function getDimensionLabel(dimension) {
  const methodology = [dimension.methodology_code, dimension.methodology_name].filter(Boolean).join(' - ')
  const dimensionLabel = [dimension.code, dimension.name].filter(Boolean).join(' - ')
  return [methodology, dimensionLabel].filter(Boolean).join(' / ') || dimension.name || '-'
}

function CriteriaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [dimensions, setDimensions] = useState([])
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedDimensions, loadedModels] = await Promise.all([
          fetchAllPages('/evaluation-dimensions'),
          fetchAllPages('/evaluation-models'),
        ])

        setDimensions(loadedDimensions.filter((dimension) => dimension.active))
        setModels(loadedModels.filter((model) => model.active))

        if (isEditing) {
          const response = await api.get(`/criteria/${id}`)
          const criterion = response.data.data || response.data
          setForm({
            evaluation_dimension_id: String(criterion.evaluation_dimension_id || ''),
            evaluation_model_id: String(criterion.evaluation_model_id || ''),
            code: criterion.code || '',
            text: criterion.text || '',
            description: criterion.description || '',
            active: Boolean(criterion.active),
          })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do critério.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing])

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
      evaluation_dimension_id: Number(form.evaluation_dimension_id),
      evaluation_model_id: Number(form.evaluation_model_id),
      text: form.text.trim(),
      description: form.description || null,
    }

    if (isEditing) {
      payload.code = form.code.trim().toUpperCase()
    } else {
      delete payload.code
    }

    try {
      const response = isEditing
        ? await api.put(`/criteria/${id}`, payload)
        : await api.post('/criteria', payload)
      const criterion = response.data.data || response.data

      navigate(`/criteria/${criterion.id}`, { state: { message: `Critério ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar o critério.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando critério..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Critério' : 'Novo Critério'} description="Preencha os dados do critério universal." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="evaluation_dimension_id">Dimensão</label>
            <select className="form-select" id="evaluation_dimension_id" name="evaluation_dimension_id" value={form.evaluation_dimension_id} onChange={updateField} required>
              <option value="">Selecione</option>
              {dimensions.map((dimension) => (
                <option key={dimension.id} value={dimension.id}>{getDimensionLabel(dimension)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="evaluation_model_id">Modelo de Avaliação</label>
            <select className="form-select" id="evaluation_model_id" name="evaluation_model_id" value={form.evaluation_model_id} onChange={updateField} required>
              <option value="">Selecione</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.code} - {model.name}</option>
              ))}
            </select>
          </div>
          {isEditing && (
            <div className="col-md-4">
              <label className="form-label" htmlFor="code">Código</label>
              <input className="form-control text-uppercase" id="code" name="code" value={form.code} readOnly />
            </div>
          )}
          <div className="col-12">
            <label className="form-label" htmlFor="text">Texto universal</label>
            <textarea className="form-control" id="text" name="text" value={form.text} onChange={updateField} rows="4" required />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="description">Descrição</label>
            <textarea className="form-control" id="description" name="description" value={form.description} onChange={updateField} rows="3" />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
              <label className="form-check-label" htmlFor="active">Ativo</label>
            </div>
          </div>
          <FormActions>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <Link className="btn btn-outline-secondary" to="/criteria">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default CriteriaForm
