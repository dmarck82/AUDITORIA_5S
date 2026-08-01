import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, PageActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'
import { getSupervisionStatusVariant } from './supervisionStatus'

function formatPercentage(value) {
  return value === null || value === undefined ? '-' : `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}

function selectedAnswerLabel(answer) {
  if (answer.not_applicable) return 'Não aplicável'
  return answer.response_options.find((option) => option.value === answer.selected_value)?.label || 'Não respondido'
}

function SupervisionsView() {
  const { id } = useParams()
  const location = useLocation()
  const [supervision, setSupervision] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAssume, setShowAssume] = useState(false)
  const [justification, setJustification] = useState('')
  const [alert, setAlert] = useState(location.state?.message ? { type: 'success', message: location.state.message } : null)

  useEffect(() => {
    const loadSupervision = async () => {
      try {
        const response = await api.get(`/supervisions/${id}`)
        setSupervision(response.data.data || response.data)
      } catch (error) {
        setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível carregar a supervisão.' })
      } finally {
        setLoading(false)
      }
    }

    loadSupervision()
  }, [id])

  const finalizeSupervision = async () => {
    if (!window.confirm('Deseja finalizar esta supervisão? Ela ficará imutável.')) return

    setSaving(true)
    setAlert(null)
    try {
      const response = await api.post(`/supervisions/${id}/finalize`)
      setSupervision(response.data.data || response.data)
      setAlert({ type: 'success', message: 'Supervisão finalizada com sucesso.' })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível finalizar a supervisão.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  const assumeSupervision = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)
    try {
      const response = await api.post(`/supervisions/${id}/assume`, { justification })
      setSupervision(response.data.data || response.data)
      setJustification('')
      setShowAssume(false)
      setAlert({ type: 'success', message: 'Você assumiu a responsabilidade por esta supervisão.' })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível assumir a supervisão.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading message="Carregando supervisão..." />

  return (
    <section>
      <PageHeader
        title={`Supervisão #${id}`}
        description="Acompanhe o fluxo, a responsabilidade e as respostas da supervisão 5S."
        actions={(
          <PageActions>
            <Link className="btn btn-outline-secondary" to="/supervisions">Voltar</Link>
            {supervision?.actions?.can_configure && <Link className="btn btn-primary" to={`/supervisions/${id}/edit`}>Configurar</Link>}
            {supervision?.actions?.can_answer && <Link className="btn btn-primary" to={`/supervisions/${id}/edit`}>Responder</Link>}
            {supervision?.actions?.can_assume && <button className="btn btn-warning" type="button" onClick={() => setShowAssume(true)}>Assumir responsabilidade</button>}
            {supervision?.actions?.can_finalize && <button className="btn btn-success" type="button" disabled={saving} onClick={finalizeSupervision}>Finalizar</button>}
          </PageActions>
        )}
      />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

      {showAssume && supervision && (
        <div className="alert alert-warning mb-4" role="alert">
          <h2 className="h5">Assumir responsabilidade</h2>
          <p>Esta supervisão está atribuída a <strong>{supervision.responsible_user_name}</strong>. Ao confirmar, você se tornará o responsável atual e a justificativa ficará registrada permanentemente.</p>
          <form onSubmit={assumeSupervision}>
            <label className="form-label" htmlFor="assumption-justification">Justificativa obrigatória</label>
            <textarea className="form-control" id="assumption-justification" value={justification} onChange={(event) => setJustification(event.target.value)} maxLength="5000" rows="3" required />
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-warning" type="submit" disabled={saving || !justification.trim()}>{saving ? 'Assumindo...' : 'Confirmar assunção'}</button>
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowAssume(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {supervision && (
        <>
          <Card className="mb-3" header="Identificação e fluxo">
            <dl className="row mb-0">
              <dt className="col-sm-3">Status</dt><dd className="col-sm-9"><StatusBadge variant={getSupervisionStatusVariant(supervision.status)}>{supervision.status_label}</StatusBadge></dd>
              <dt className="col-sm-3">Organização</dt><dd className="col-sm-9">{supervision.local_1_name}</dd>
              <dt className="col-sm-3">Setor/OMDS</dt><dd className="col-sm-9">{supervision.local_2_name}</dd>
              <dt className="col-sm-3">Subsetor/Seção</dt><dd className="col-sm-9">{supervision.local_3_name}</dd>
              <dt className="col-sm-3">Ambiente de Trabalho</dt><dd className="col-sm-9">{supervision.work_environment_name}</dd>
              <dt className="col-sm-3">Responsável inicial</dt><dd className="col-sm-9">{supervision.initial_responsible_user_name}</dd>
              <dt className="col-sm-3">Responsável atual</dt><dd className="col-sm-9">{supervision.responsible_user_name}</dd>
              <dt className="col-sm-3">Criada por</dt><dd className="col-sm-9">{supervision.operator_name}</dd>
              <dt className="col-sm-3">Criada em</dt><dd className="col-sm-9">{formatDateTime(supervision.started_at)}</dd>
              <dt className="col-sm-3">Enviada em</dt><dd className="col-sm-9">{formatDateTime(supervision.sent_at)}</dd>
              <dt className="col-sm-3">Preenchimento iniciado em</dt><dd className="col-sm-9">{formatDateTime(supervision.response_started_at)}</dd>
              <dt className="col-sm-3">Respondida em</dt><dd className="col-sm-9">{formatDateTime(supervision.answered_at)}</dd>
              <dt className="col-sm-3">Finalizada em</dt><dd className="col-sm-9">{formatDateTime(supervision.finalized_at)}</dd>
            </dl>
          </Card>

          {supervision.responsibility_transfers?.length > 0 && (
            <Card className="mb-3" header="Histórico de responsabilidade">
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead><tr><th>Data</th><th>Responsável anterior</th><th>Novo responsável</th><th>Executado por</th><th>Justificativa</th></tr></thead>
                  <tbody>
                    {supervision.responsibility_transfers.map((transfer) => (
                      <tr key={transfer.id}>
                        <td>{formatDateTime(transfer.created_at)}</td>
                        <td>{transfer.from_user_name}</td>
                        <td>{transfer.to_user_name}</td>
                        <td>{transfer.assumed_by_name}</td>
                        <td className="text-wrap">{transfer.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card className="mb-3" header="Resultado">
            <div className="row g-3 mb-4">
              <div className="col-md-3"><strong>Percentual</strong><div className="fs-4">{formatPercentage(supervision.score.percentage)}</div></div>
              <div className="col-md-3"><strong>Pontuação</strong><div className="fs-4">{supervision.score.obtained_points}/{supervision.score.maximum_points}</div></div>
              <div className="col-md-3"><strong>Não aplicáveis</strong><div className="fs-4">{supervision.score.not_applicable_criteria}</div></div>
              <div className="col-md-3"><strong>Não conformidades</strong><div className="fs-4">{supervision.score.nonconformities}</div></div>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead><tr><th>Senso 5S</th><th>Respondidos</th><th>Pontos</th><th>Resultado</th><th>Não conformidades</th></tr></thead>
                <tbody>
                  {supervision.scores_by_sense.map((score) => (
                    <tr key={score.sense}>
                      <td>{score.sense_label}</td>
                      <td>{score.answered_criteria}/{score.total_criteria}</td>
                      <td>{score.obtained_points}/{score.maximum_points}</td>
                      <td>{formatPercentage(score.percentage)}</td>
                      <td>{score.nonconformities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card header="Respostas">
            <div className="d-grid gap-4">
              {supervision.answers.map((answer) => (
                <div className="border-bottom pb-3" key={answer.id}>
                  <div className="fw-semibold">{answer.sense_label} — {answer.criterion_code}</div>
                  <div>{answer.question}</div>
                  <div className="mt-2"><strong>Resposta:</strong> {selectedAnswerLabel(answer)}</div>
                  {answer.observation && <div><strong>Observação:</strong> {answer.observation}</div>}
                  {answer.evidence && <div><strong>Evidência:</strong> {answer.evidence}</div>}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </section>
  )
}

export default SupervisionsView
