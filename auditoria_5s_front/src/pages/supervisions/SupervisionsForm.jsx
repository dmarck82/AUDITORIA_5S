import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, FormActions, FormSection, PageHeader, StatusBadge } from '../../components/ui'
import { getSupervisionStatusVariant } from './supervisionStatus'

const emptyForm = { work_environment_id: '', responsible_user_id: '' }

function environmentLabel(environment) {
  const hierarchy = [environment.name, environment.local3?.name, environment.local3?.local2?.name].filter(Boolean).join(' — ')
  const count = environment.active_verification_criteria_count ?? 0

  return `${hierarchy} (${count} ${count === 1 ? 'critério' : 'critérios'})`
}

function answerPayload(answer) {
  return {
    id: answer.id,
    selected_value: answer.not_applicable || answer.selected_value === '' || answer.selected_value === null ? null : Number(answer.selected_value),
    not_applicable: Boolean(answer.not_applicable),
    observation: answer.observation || null,
    evidence: answer.evidence || null,
  }
}

function SupervisionsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [supervision, setSupervision] = useState(null)
  const [answers, setAnswers] = useState([])
  const [workEnvironments, setWorkEnvironments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadOptions = async () => {
      const response = await api.get('/supervisions/options')
      const options = response.data.data || response.data
      setWorkEnvironments(options.work_environments || [])
      setUsers(options.responsible_users || [])
    }

    const loadData = async () => {
      try {
        if (!isEditing) {
          await loadOptions()
          return
        }

        const response = await api.get(`/supervisions/${id}`)
        const item = response.data.data || response.data
        setSupervision(item)
        setForm({
          work_environment_id: item.work_environment_id || '',
          responsible_user_id: item.responsible_user_id || '',
        })
        setAnswers(item.answers || [])

        if (item.actions?.can_configure) await loadOptions()
      } catch (error) {
        setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível carregar os dados da supervisão.' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, isEditing])

  const groupedAnswers = useMemo(() => answers.reduce((groups, answer) => {
    const key = answer.sense
    if (!groups[key]) groups[key] = { label: answer.sense_label, answers: [] }
    groups[key].answers.push(answer)
    return groups
  }, {}), [answers])

  const canConfigure = Boolean(supervision?.actions?.can_configure)
  const canAnswer = Boolean(supervision?.actions?.can_answer)

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const updateAnswer = (answerId, field, value) => {
    setAnswers((current) => current.map((answer) => {
      if (answer.id !== answerId) return answer

      if (field === 'not_applicable') {
        return { ...answer, not_applicable: value, selected_value: value ? '' : answer.selected_value }
      }

      return { ...answer, [field]: value }
    }))
  }

  const persistConfiguration = async () => {
    const response = await api.put(`/supervisions/${id}`, form)
    const item = response.data.data || response.data
    setSupervision(item)
    setAnswers(item.answers || [])
    return item
  }

  const persistAnswers = async () => {
    const response = await api.put(`/supervisions/${id}/answers`, {
      answers: answers.map(answerPayload),
    })
    const item = response.data.data || response.data
    setSupervision(item)
    setAnswers(item.answers || [])
    return item
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (!isEditing) {
        const response = await api.post('/supervisions', form)
        const created = response.data.data || response.data
        navigate(`/supervisions/${created.id}/edit`, { replace: true, state: { message: 'Supervisão criada como rascunho.' } })
        return
      }

      if (canConfigure) {
        await persistConfiguration()
        setAlert({ type: 'success', message: 'Rascunho salvo com sucesso.' })
      } else if (canAnswer) {
        await persistAnswers()
        setAlert({ type: 'success', message: 'Andamento salvo com sucesso.' })
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível salvar a supervisão.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  const sendSupervision = async () => {
    if (!window.confirm('Deseja enviar esta supervisão para o responsável?')) return

    setSaving(true)
    setAlert(null)
    try {
      await persistConfiguration()
      await api.post(`/supervisions/${id}/send`)
      navigate(`/supervisions/${id}`, { replace: true, state: { message: 'Supervisão enviada para resposta.' } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível enviar a supervisão.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  const submitAnswers = async () => {
    if (!window.confirm('Deseja entregar as respostas? Após a entrega, elas não poderão ser alteradas.')) return

    setSaving(true)
    setAlert(null)
    try {
      await persistAnswers()
      await api.post(`/supervisions/${id}/submit`)
      navigate(`/supervisions/${id}`, { replace: true, state: { message: 'Respostas entregues com sucesso.' } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível entregar as respostas.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Carregando supervisão..." />

  return (
    <section>
      <PageHeader
        title={isEditing ? `${canConfigure ? 'Configurar' : 'Responder'} Supervisão #${id}` : 'Nova Supervisão 5S'}
        description={isEditing ? 'Execute somente as ações disponíveis para o status e sua responsabilidade.' : 'Selecione um ambiente e um responsável dentro do seu escopo.'}
      />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      {supervision && (
        <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
          <StatusBadge variant={getSupervisionStatusVariant(supervision.status)}>{supervision.status_label}</StatusBadge>
          <span className="text-secondary">
            {supervision.score?.answered_criteria || 0} de {supervision.score?.total_criteria || 0} critérios preenchidos
          </span>
        </div>
      )}
      <form onSubmit={submitForm}>
        <FormSection>
          {(!isEditing || canConfigure) ? (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="work_environment_id">Ambiente de Trabalho</label>
                <select className="form-select" id="work_environment_id" name="work_environment_id" value={form.work_environment_id} onChange={updateForm} required>
                  <option value="">Selecione um ambiente</option>
                  {workEnvironments.map((environment) => <option key={environment.id} value={environment.id}>{environmentLabel(environment)}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="responsible_user_id">Responsável pela resposta</label>
                <select className="form-select" id="responsible_user_id" name="responsible_user_id" value={form.responsible_user_id} onChange={updateForm} required>
                  <option value="">Selecione um responsável</option>
                  {users.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <dl className="row mb-0">
              <dt className="col-sm-3">Ambiente de Trabalho</dt><dd className="col-sm-9">{supervision?.work_environment_name}</dd>
              <dt className="col-sm-3">Responsável atual</dt><dd className="col-sm-9">{supervision?.responsible_user_name}</dd>
            </dl>
          )}
        </FormSection>

        {isEditing && Object.entries(groupedAnswers).map(([sense, group]) => (
          <Card className="mb-3" header={group.label} key={sense}>
            <div className="d-grid gap-4">
              {group.answers.map((answer) => (
                <fieldset className="border-bottom pb-4" disabled={!canAnswer} key={answer.id}>
                  <legend className="fs-6 fw-semibold">{answer.criterion_code} — {answer.question}</legend>
                  <div className="d-grid gap-2 mt-3">
                    {answer.response_options.map((option) => (
                      <label className="form-check" key={option.value}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`answer-${answer.id}`}
                          value={option.value}
                          checked={!answer.not_applicable && String(answer.selected_value) === String(option.value)}
                          onChange={(event) => updateAnswer(answer.id, 'selected_value', event.target.value)}
                        />
                        <span className="form-check-label">{option.label}</span>
                      </label>
                    ))}
                    <label className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={Boolean(answer.not_applicable)}
                        onChange={(event) => updateAnswer(answer.id, 'not_applicable', event.target.checked)}
                      />
                      <span className="form-check-label">Não aplicável</span>
                    </label>
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor={`observation-${answer.id}`}>Observação</label>
                      <textarea
                        className="form-control"
                        id={`observation-${answer.id}`}
                        value={answer.observation || ''}
                        onChange={(event) => updateAnswer(answer.id, 'observation', event.target.value)}
                        rows="3"
                        required={!answer.not_applicable && ['0', '5'].includes(String(answer.selected_value))}
                      />
                      <div className="form-text">Obrigatória para respostas de 0 ou 5 pontos.</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor={`evidence-${answer.id}`}>Evidência (opcional)</label>
                      <textarea
                        className="form-control"
                        id={`evidence-${answer.id}`}
                        value={answer.evidence || ''}
                        onChange={(event) => updateAnswer(answer.id, 'evidence', event.target.value)}
                        rows="3"
                      />
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>
          </Card>
        ))}

        <FormActions>
          {!isEditing && <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Criando...' : 'Criar rascunho'}</button>}
          {canConfigure && <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar rascunho'}</button>}
          {supervision?.actions?.can_send && <button className="btn btn-success" type="button" onClick={sendSupervision} disabled={saving}>Enviar para resposta</button>}
          {canAnswer && <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar andamento'}</button>}
          {supervision?.actions?.can_submit && <button className="btn btn-success" type="button" onClick={submitAnswers} disabled={saving}>Entregar respostas</button>}
          <Link className="btn btn-outline-secondary" to="/supervisions">Cancelar</Link>
        </FormActions>
      </form>
    </section>
  )
}

export default SupervisionsForm
