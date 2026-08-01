import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = { local_2_id: '', name: '', description: '', active: true }

function getLocal2Label(local2) {
  return [local2.name, local2.local_1_name].filter(Boolean).join(' - ')
}

function Local3sForm() {
  const { id } = useParams(); const navigate = useNavigate(); const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm); const [local2s, setLocal2s] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [alert, setAlert] = useState(null)
  useEffect(() => { const loadFormData = async () => { try { setLocal2s(await fetchAllPages('/local2s')); if (isEditing) { const local3Response = await api.get(`/local3s/${id}`); const local3 = local3Response.data.data || local3Response.data; setForm({ local_2_id: local3.local_2_id || '', name: local3.name || '', description: local3.description || '', active: Boolean(local3.active) }) } } catch { setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do subsetor/seção.' }) } finally { setLoading(false) } }; loadFormData() }, [id, isEditing])
  const updateField = (event) => { const { name, value, type, checked } = event.target; setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value })) }
  const buildPayload = () => ({ ...form, description: form.description || null })
  const submitForm = async (event) => { event.preventDefault(); setSaving(true); setAlert(null); try { if (isEditing) await api.put(`/local3s/${id}`, buildPayload()); else await api.post('/local3s', buildPayload()); navigate('/local3s', { state: { message: `Subsetor/Seção ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } }) } catch (error) { setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar o subsetor/seção.', errors: error.response?.data?.errors }) } finally { setSaving(false) } }
  if (loading) return <Loading message="Carregando subsetor/seção..." />

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Subsetor/Seção' : 'Novo Subsetor/Seção'} description="Vincule o subsetor/seção a um Setor/OMDS." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="local_2_id">Setor/OMDS</label>
            <select className="form-select" id="local_2_id" name="local_2_id" value={form.local_2_id} onChange={updateField} required>
              <option value="">Selecione um Setor/OMDS</option>
              {local2s.map((local2) => <option key={local2.id} value={local2.id}>{getLocal2Label(local2)}</option>)}
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
            <Link className="btn btn-outline-secondary" to="/local3s">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default Local3sForm
