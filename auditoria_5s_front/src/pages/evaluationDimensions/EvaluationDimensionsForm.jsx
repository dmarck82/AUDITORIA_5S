import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = {
  methodology_id: '',
  code: '',
  name: '',
  objective: '',
  sort_order: 1,
  active: true,
}

function EvaluationDimensionsForm() {
  const { id, methodologyId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState({ ...emptyForm, methodology_id: methodologyId || '' })
  const [methodologies, setMethodologies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const loadedMethodologies = await fetchAllPages('/methodologies')
        setMethodologies(loadedMethodologies.filter((methodology) => methodology.active))

        if (isEditing) {
          const response = await api.get(`/evaluation-dimensions/${id}`)
          const dimension = response.data.data || response.data
          setForm({
            methodology_id: String(dimension.methodology_id || ''),
            code: dimension.code || '',
            name: dimension.name || '',
            objective: dimension.objective || '',
            sort_order: dimension.sort_order || 1,
            active: Boolean(dimension.active),
          })
        } else if (methodologyId) {
          setForm((currentForm) => ({ ...currentForm, methodology_id: String(methodologyId) }))
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados da dimensão.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing, methodologyId])

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
      methodology_id: Number(form.methodology_id),
      code: form.code.trim().toUpperCase(),
      objective: form.objective || null,
      sort_order: Number(form.sort_order),
    }

    try {
      const response = isEditing
        ? await api.put(`/evaluation-dimensions/${id}`, payload)
        : await api.post('/evaluation-dimensions', payload)
      const dimension = response.data.data || response.data
      const targetMethodologyId = methodologyId || dimension.methodology_id || form.methodology_id

      navigate(`/methodologies/${targetMethodologyId}`, { state: { message: `Dimensão ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a dimensão.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando dimensão..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Dimensão' : 'Nova Dimensão'} description="Preencha os dados da dimensão de avaliação." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="methodology_id">Metodologia</label>
            <select className="form-select" id="methodology_id" name="methodology_id" value={form.methodology_id} onChange={updateField} required>
              <option value="">Selecione</option>
              {methodologies.map((methodology) => (
                <option key={methodology.id} value={methodology.id}>{methodology.code} - {methodology.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="code">Código</label>
            <input className="form-control text-uppercase" id="code" maxLength="80" name="code" value={form.code} onChange={updateField} required />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="sort_order">Ordem</label>
            <input className="form-control" id="sort_order" min="1" name="sort_order" type="number" value={form.sort_order} onChange={updateField} required />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="name">Nome</label>
            <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="objective">Objetivo</label>
            <textarea className="form-control" id="objective" name="objective" value={form.objective} onChange={updateField} rows="4" />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
              <label className="form-check-label" htmlFor="active">Ativo</label>
            </div>
          </div>
          <FormActions>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <Link className="btn btn-outline-secondary" to={methodologyId ? `/methodologies/${methodologyId}` : '/evaluation-dimensions'}>Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default EvaluationDimensionsForm
