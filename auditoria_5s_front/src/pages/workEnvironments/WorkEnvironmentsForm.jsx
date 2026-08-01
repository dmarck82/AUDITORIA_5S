import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = { local_3_id: '', name: '', description: '', active: true }

function getLocal3Label(local3) {
  return [local3.name, local3.local2?.name].filter(Boolean).join(' - ')
}

function WorkEnvironmentsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [local3s, setLocal3s] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLocal3s(await fetchAllPages('/local3s'))

        if (isEditing) {
          const response = await api.get(`/work-environments/${id}`)
          const workEnvironment = response.data.data || response.data
          setForm({
            local_3_id: workEnvironment.local_3_id || '',
            name: workEnvironment.name || '',
            description: workEnvironment.description || '',
            active: Boolean(workEnvironment.active),
          })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do ambiente de trabalho.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      const payload = { ...form, description: form.description || null }
      if (isEditing) await api.put(`/work-environments/${id}`, payload)
      else await api.post('/work-environments', payload)
      navigate('/work-environments', { state: { message: `Ambiente de Trabalho ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível salvar o ambiente de trabalho.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Carregando ambiente de trabalho..." />

  return (
    <section>
      <PageHeader
        title={isEditing ? 'Editar Ambiente de Trabalho' : 'Novo Ambiente de Trabalho'}
        description="Vincule o ambiente de trabalho a um Subsetor/Seção."
      />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="local_3_id">Subsetor/Seção</label>
            <select className="form-select" id="local_3_id" name="local_3_id" value={form.local_3_id} onChange={updateField} required>
              <option value="">Selecione um Subsetor/Seção</option>
              {local3s.map((local3) => <option key={local3.id} value={local3.id}>{getLocal3Label(local3)}</option>)}
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
            <Link className="btn btn-outline-secondary" to="/work-environments">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default WorkEnvironmentsForm
