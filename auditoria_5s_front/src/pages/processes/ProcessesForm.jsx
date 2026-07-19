import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = { sector_id: '', name: '', description: '', active: true }

function getSectorLabel(sector) {
  return [sector.name, sector.unit?.name, sector.unit?.organization_name].filter(Boolean).join(' - ')
}

function ProcessesForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setSectors(await fetchAllPages('/sectors'))

        if (isEditing) {
          const response = await api.get(`/processes/${id}`)
          const process = response.data.data || response.data
          setForm({
            sector_id: process.sector_id || '',
            name: process.name || '',
            description: process.description || '',
            active: Boolean(process.active),
          })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do processo.' })
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

  const buildPayload = () => ({ ...form, description: form.description || null })

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (isEditing) {
        await api.put(`/processes/${id}`, buildPayload())
      } else {
        await api.post('/processes', buildPayload())
      }

      navigate('/processes', { state: { message: `Processo ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar o processo.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando processo..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Processo' : 'Novo Processo'} description="Vincule o processo a um setor." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="sector_id">Setor</label>
            <select className="form-select" id="sector_id" name="sector_id" value={form.sector_id} onChange={updateField} required>
              <option value="">Selecione um setor</option>
              {sectors.map((sector) => <option key={sector.id} value={sector.id}>{getSectorLabel(sector)}</option>)}
            </select>
          </div>
          <div className="col-md-6">
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
            <Link className="btn btn-outline-secondary" to="/processes">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default ProcessesForm

