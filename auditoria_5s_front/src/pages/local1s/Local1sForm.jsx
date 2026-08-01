import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'

const emptyForm = {
  name: '',
  active: true,
}

function Local1sForm() {
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

    const loadLocal1 = async () => {
      try {
        const response = await api.get(`/local1s/${id}`)
        const local1 = response.data.data || response.data
        setForm({
          name: local1.name || '',
          active: Boolean(local1.active),
        })
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a organização.' })
      } finally {
        setLoading(false)
      }
    }

    loadLocal1()
  }, [id, isEditing])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (isEditing) {
        await api.put(`/local1s/${id}`, form)
      } else {
        await api.post('/local1s', form)
      }

      navigate('/local1s', { state: { message: `Organização ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a organização.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando organização..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Organização' : 'Nova Organização'} description="Preencha os dados da organização." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-8">
          <label className="form-label" htmlFor="name">Nome</label>
          <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
            <label className="form-check-label" htmlFor="active">Ativo</label>
          </div>
        </div>
        <FormActions>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          <Link className="btn btn-outline-secondary" to="/local1s">Cancelar</Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  )
}

export default Local1sForm
