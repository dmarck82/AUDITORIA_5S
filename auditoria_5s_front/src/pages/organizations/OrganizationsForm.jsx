import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'

const emptyForm = {
  name: '',
  active: true,
}

function OrganizationsForm() {
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

    const loadOrganization = async () => {
      try {
        const response = await api.get(`/organizations/${id}`)
        const organization = response.data.data || response.data
        setForm({
          name: organization.name || '',
          active: Boolean(organization.active),
        })
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar a organização.' })
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
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
        await api.put(`/organizations/${id}`, form)
      } else {
        await api.post('/organizations', form)
      }

      navigate('/organizations', { state: { message: `Organização ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
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
      <div className="mb-4">
        <h1 className="h3 mb-1">{isEditing ? 'Editar Organização' : 'Nova Organização'}</h1>
        <p className="text-secondary mb-0">Preencha os dados da organização.</p>
      </div>
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
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
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          <Link className="btn btn-outline-secondary" to="/organizations">Cancelar</Link>
        </div>
      </form>
    </section>
  )
}

export default OrganizationsForm
