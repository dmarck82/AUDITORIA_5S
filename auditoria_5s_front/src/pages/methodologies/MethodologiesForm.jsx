import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'

const emptyForm = {
  code: '',
  name: '',
  description: '',
  active: true,
}

function MethodologiesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const loadMethodology = async () => {
      try {
        const response = await api.get(`/methodologies/${id}`)
        const methodology = response.data.data || response.data
        setForm({
          code: methodology.code || '',
          name: methodology.name || '',
          description: methodology.description || '',
          active: Boolean(methodology.active),
        })
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a metodologia.' })
      } finally {
        setLoading(false)
      }
    }

    loadMethodology()
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
      name: form.name,
      description: form.description || null,
      active: form.active,
    }

    if (isEditing) {
      payload.code = form.code.trim().toUpperCase()
    }

    try {
      if (isEditing) {
        await api.put(`/methodologies/${id}`, payload)
      } else {
        await api.post('/methodologies', payload)
      }

      navigate('/methodologies', { state: { message: `Metodologia ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a metodologia.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando metodologia..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Metodologia' : 'Nova Metodologia'} description="Preencha os dados da metodologia." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          {isEditing && (
            <div className="col-md-4">
              <label className="form-label" htmlFor="code">Código</label>
              <input className="form-control text-uppercase" id="code" name="code" value={form.code} readOnly />
            </div>
          )}
          <div className={isEditing ? 'col-md-8' : 'col-12'}>
            <label className="form-label" htmlFor="name">Nome</label>
            <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
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
            <Link className="btn btn-outline-secondary" to="/methodologies">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default MethodologiesForm

