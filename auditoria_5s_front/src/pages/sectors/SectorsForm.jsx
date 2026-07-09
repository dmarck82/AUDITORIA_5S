import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = { unit_id: '', name: '', description: '', active: true }

function getUnitLabel(unit) {
  return [unit.name, unit.organization_name].filter(Boolean).join(' - ')
}

function SectorsForm() {
  const { id } = useParams(); const navigate = useNavigate(); const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm); const [units, setUnits] = useState([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [alert, setAlert] = useState(null)
  useEffect(() => { const loadFormData = async () => { try { setUnits(await fetchAllPages('/units')); if (isEditing) { const sectorResponse = await api.get(`/sectors/${id}`); const sector = sectorResponse.data.data || sectorResponse.data; setForm({ unit_id: sector.unit_id || '', name: sector.name || '', description: sector.description || '', active: Boolean(sector.active) }) } } catch { setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do setor.' }) } finally { setLoading(false) } }; loadFormData() }, [id, isEditing])
  const updateField = (event) => { const { name, value, type, checked } = event.target; setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value })) }
  const buildPayload = () => ({ ...form, description: form.description || null })
  const submitForm = async (event) => { event.preventDefault(); setSaving(true); setAlert(null); try { if (isEditing) await api.put(`/sectors/${id}`, buildPayload()); else await api.post('/sectors', buildPayload()); navigate('/sectors', { state: { message: `Setor ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } }) } catch (error) { setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar o setor.', errors: error.response?.data?.errors }) } finally { setSaving(false) } }
  if (loading) return <Loading message="Carregando setor..." />

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Setor' : 'Novo Setor'} description="Vincule o setor a uma unidade." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          <div className="col-md-6">
            <label className="form-label" htmlFor="unit_id">Unidade</label>
            <select className="form-select" id="unit_id" name="unit_id" value={form.unit_id} onChange={updateField} required>
              <option value="">Selecione uma unidade</option>
              {units.map((unit) => <option key={unit.id} value={unit.id}>{getUnitLabel(unit)}</option>)}
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
            <Link className="btn btn-outline-secondary" to="/sectors">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default SectorsForm
