import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { FIVE_S_SENSES } from '../../constants/fiveSSenses'
import { DEFAULT_RESPONSE_LABELS, RESPONSE_SCORES } from '../../constants/responseScores'

const emptyForm = { code: '', sense: '', question: '', ...DEFAULT_RESPONSE_LABELS, active: true }

function VerificationCriteriaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    if (!isEditing) return

    const loadCriterion = async () => {
      try {
        const response = await api.get(`/verification-criteria/${id}`)
        const criterion = response.data.data || response.data
        setForm({
          code: criterion.code || '',
          sense: criterion.sense || '',
          question: criterion.question || '',
          response_0_label: criterion.response_0_label || DEFAULT_RESPONSE_LABELS.response_0_label,
          response_5_label: criterion.response_5_label || DEFAULT_RESPONSE_LABELS.response_5_label,
          response_10_label: criterion.response_10_label || DEFAULT_RESPONSE_LABELS.response_10_label,
          response_15_label: criterion.response_15_label || DEFAULT_RESPONSE_LABELS.response_15_label,
          active: Boolean(criterion.active),
        })
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar o critério de verificação.' })
      } finally {
        setLoading(false)
      }
    }

    loadCriterion()
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
      const payload = { ...form }
      delete payload.code
      if (isEditing) delete payload.sense

      if (isEditing) await api.put(`/verification-criteria/${id}`, payload)
      else await api.post('/verification-criteria', payload)
      navigate('/verification-criteria', { state: { message: `Critério de Verificação ${isEditing ? 'atualizado' : 'criado'} com sucesso.` } })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível salvar o critério de verificação.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Carregando critério de verificação..." />

  return (
    <section>
      <PageHeader
        title={isEditing ? 'Editar Critério de Verificação' : 'Novo Critério de Verificação'}
        description="Cadastre uma pergunta padrão e classifique-a em um dos cinco sensos."
      />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
        <form className="row g-3" onSubmit={submitForm}>
          {isEditing && (
            <div className="col-md-4">
              <label className="form-label" htmlFor="code">Código</label>
              <input className="form-control" id="code" name="code" value={form.code} readOnly />
            </div>
          )}
          <div className={isEditing ? 'col-md-8' : 'col-12'}>
            <label className="form-label" htmlFor="sense">Senso 5S</label>
            <select className="form-select" id="sense" name="sense" value={form.sense} onChange={updateField} disabled={isEditing} required>
              <option value="">Selecione um senso</option>
              {FIVE_S_SENSES.map((sense) => <option key={sense.value} value={sense.value}>{sense.label}</option>)}
            </select>
            {!isEditing && <div className="form-text">O código será gerado automaticamente conforme o senso selecionado.</div>}
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="question">Pergunta</label>
            <textarea className="form-control" id="question" name="question" value={form.question} onChange={updateField} maxLength="2000" rows="5" required />
          </div>
          <div className="col-12">
            <h2 className="h5">Opções de resposta</h2>
            <p className="text-secondary">Os valores 0, 5, 10 e 15 são fixos. Campos vazios usarão o texto padrão.</p>
          </div>
          {RESPONSE_SCORES.map((score) => (
            <div className="col-md-6" key={score.value}>
              <label className="form-label" htmlFor={score.field}>Resposta para {score.value} pontos</label>
              <input className="form-control" id={score.field} name={score.field} value={form[score.field]} onChange={updateField} maxLength="500" />
            </div>
          ))}
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
              <label className="form-check-label" htmlFor="active">Ativo</label>
            </div>
          </div>
          <FormActions>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            <Link className="btn btn-outline-secondary" to="/verification-criteria">Cancelar</Link>
          </FormActions>
        </form>
      </FormSection>
    </section>
  )
}

export default VerificationCriteriaForm
