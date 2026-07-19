import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { nextAvailableSortOrder } from '../../utils/sortOrder'

const emptyForm = { process_id: '', name: '', description: '', sort_order: 1, active: true }

function ActivitiesForm() {
  const { id, processId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [process, setProcess] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        if (isEditing) {
          const activityResponse = await api.get(`/activities/${id}`)
          const activity = activityResponse.data.data || activityResponse.data
          const loadedProcess = activity.process

          setProcess(loadedProcess)
          setForm({
            process_id: activity.process_id || '',
            name: activity.name || '',
            description: activity.description || '',
            sort_order: activity.sort_order || 1,
            active: Boolean(activity.active),
          })
        } else {
          const processResponse = await api.get(`/processes/${processId}`)
          const loadedProcess = processResponse.data.data || processResponse.data
          const nextOrder = nextAvailableSortOrder(loadedProcess.activities || [])

          setProcess(loadedProcess)
          setForm({ ...emptyForm, process_id: loadedProcess.id, sort_order: nextOrder })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados da atividade.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing, processId])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value }))
  }

  const buildPayload = () => ({
    ...form,
    process_id: Number(form.process_id),
    sort_order: Number(form.sort_order),
    description: form.description || null,
  })

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (isEditing) {
        await api.put(`/activities/${id}`, buildPayload())
      } else {
        await api.post('/activities', buildPayload())
      }

      navigate(`/processes/${form.process_id}`, { state: { message: `Atividade ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a atividade.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando atividade..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Atividade' : 'Nova Atividade'} description={process?.name ? `Processo: ${process.name}` : 'Vincule a atividade ao processo.'} />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-8">
            <label className="form-label" htmlFor="name">Nome</label>
            <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
          </div>
          <div className="col-md-4">
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
            <Link className="btn btn-outline-secondary" to={form.process_id ? `/processes/${form.process_id}` : '/processes'}>Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default ActivitiesForm

