import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'
import { dateTimeLocalToIso, getAssessmentStatusLabel, toDateTimeLocalValue } from './assessmentStatus'

const emptyForm = {
  title: '',
  questionnaire_id: '',
  organization_id: '',
  unit_id: '',
  sector_id: '',
  person_id: '',
  status: 'DRAFT',
  expires_at: '',
  active: true,
}

function AssessmentForm() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const returnTo = location.state?.returnTo || '/assessments'
  const [form, setForm] = useState(emptyForm)
  const [questionnaires, setQuestionnaires] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [units, setUnits] = useState([])
  const [sectors, setSectors] = useState([])
  const [people, setPeople] = useState([])
  const [statuses, setStatuses] = useState([])
  const [originalStatus, setOriginalStatus] = useState('DRAFT')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  const availableQuestionnaires = useMemo(() => questionnaires.filter((questionnaire) => questionnaire.active), [questionnaires])
  const availableOrganizations = useMemo(() => organizations.filter((organization) => organization.active), [organizations])

  const availableUnits = useMemo(() => {
    if (!form.organization_id) return []
    return units.filter((unit) => unit.active && String(unit.organization_id) === String(form.organization_id))
  }, [form.organization_id, units])

  const availableSectors = useMemo(() => {
    if (!form.unit_id) return []
    return sectors.filter((sector) => sector.active && String(sector.unit_id) === String(form.unit_id))
  }, [form.unit_id, sectors])

  const availablePeople = useMemo(() => {
    if (!form.organization_id) return []

    return people.filter((person) => {
      if (!person.active || String(person.organization_id) !== String(form.organization_id)) return false
      if (form.unit_id && person.unit_id && String(person.unit_id) !== String(form.unit_id)) return false
      if (form.sector_id && person.sector_id && String(person.sector_id) !== String(form.sector_id)) return false

      return true
    })
  }, [form.organization_id, form.unit_id, form.sector_id, people])

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedQuestionnaires, loadedOrganizations, loadedUnits, loadedSectors, loadedPeople, statusesResponse] = await Promise.all([
          fetchAllPages('/questionnaires'),
          fetchAllPages('/organizations'),
          fetchAllPages('/units'),
          fetchAllPages('/sectors'),
          fetchAllPages('/people'),
          api.get('/assessments/statuses'),
        ])

        setQuestionnaires(loadedQuestionnaires)
        setOrganizations(loadedOrganizations)
        setUnits(loadedUnits)
        setSectors(loadedSectors)
        setPeople(loadedPeople)
        setStatuses(statusesResponse.data.data || statusesResponse.data)

        if (isEditing) {
          const response = await api.get(`/assessments/${id}`)
          const assessment = response.data.data || response.data
          setOriginalStatus(assessment.status || 'DRAFT')
          setForm({
            title: assessment.title || '',
            questionnaire_id: assessment.questionnaire_id || '',
            organization_id: assessment.organization_id || '',
            unit_id: assessment.unit_id || '',
            sector_id: assessment.sector_id || '',
            person_id: assessment.person_id || '',
            status: assessment.status || 'DRAFT',
            expires_at: toDateTimeLocalValue(assessment.expires_at),
            active: Boolean(assessment.active),
          })
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados da avaliação.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [name]: type === 'checkbox' ? checked : value,
      }

      if (name === 'organization_id') {
        nextForm.unit_id = ''
        nextForm.sector_id = ''
        nextForm.person_id = ''
      }

      if (name === 'unit_id') {
        nextForm.sector_id = ''
        nextForm.person_id = ''
      }

      if (name === 'sector_id') {
        nextForm.person_id = ''
      }

      return nextForm
    })
  }

  const buildPayload = () => ({
    ...form,
    unit_id: form.unit_id || null,
    sector_id: form.sector_id || null,
    expires_at: dateTimeLocalToIso(form.expires_at),
  })

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (isEditing) {
        await api.put(`/assessments/${id}`, buildPayload())
      } else {
        await api.post('/assessments', buildPayload())
      }

      navigate(returnTo, { state: { message: `Avaliação ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a avaliação.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando avaliação..." />
  }

  const questionnaireLocked = isEditing && originalStatus !== 'DRAFT'

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Avaliação' : 'Nova Avaliação'} description="Vincule o questionário à pessoa que irá responder." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-8">
          <label className="form-label" htmlFor="title">Título</label>
          <input className="form-control" id="title" name="title" value={form.title} onChange={updateField} required />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="status">Status</label>
          <select className="form-select" id="status" name="status" value={form.status} onChange={updateField} required>
            {statuses.map((status) => (
              <option key={status.code} value={status.code}>{getAssessmentStatusLabel(status.code)}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="questionnaire_id">Questionário</label>
          <select className="form-select" id="questionnaire_id" name="questionnaire_id" value={form.questionnaire_id} onChange={updateField} required disabled={questionnaireLocked}>
            <option value="">Selecione um questionário</option>
            {availableQuestionnaires.map((questionnaire) => (
              <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name}</option>
            ))}
          </select>
          {questionnaireLocked && <div className="form-text">O questionário não pode ser alterado após sair do rascunho.</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="organization_id">Organização</label>
          <select className="form-select" id="organization_id" name="organization_id" value={form.organization_id} onChange={updateField} required>
            <option value="">Selecione uma organização</option>
            {availableOrganizations.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="unit_id">Unidade</label>
          <select className="form-select" id="unit_id" name="unit_id" value={form.unit_id} onChange={updateField} disabled={!form.organization_id}>
            <option value="">Todas</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="sector_id">Setor</label>
          <select className="form-select" id="sector_id" name="sector_id" value={form.sector_id} onChange={updateField} disabled={!form.unit_id}>
            <option value="">Todos</option>
            {availableSectors.map((sector) => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="person_id">Pessoa</label>
          <select className="form-select" id="person_id" name="person_id" value={form.person_id} onChange={updateField} required disabled={!form.organization_id}>
            <option value="">Selecione uma pessoa</option>
            {availablePeople.map((person) => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="expires_at">Expira em</label>
          <input className="form-control" id="expires_at" name="expires_at" type="datetime-local" value={form.expires_at} onChange={updateField} />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
            <label className="form-check-label" htmlFor="active">Ativo</label>
          </div>
        </div>
        <FormActions>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          <Link className="btn btn-outline-secondary" to={returnTo}>Cancelar</Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  )
}

export default AssessmentForm
