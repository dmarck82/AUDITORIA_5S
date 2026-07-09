import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { Card, FormActions, PageHeader, StatusBadge } from '../../components/ui'
import { formatDateTime } from '../../utils/formatters'
import { getAssessmentStatusLabel } from '../assessments/assessmentStatus'
import { getQuestionCategoryLabel } from '../questions/questionCategories'

const scoreOptions = [
  { value: 1, label: '1 - Muito Ruim' },
  { value: 2, label: '2 - Ruim' },
  { value: 3, label: '3 - Regular' },
  { value: 4, label: '4 - Bom' },
  { value: 5, label: '5 - Muito Bom' },
]

const publicAssessmentErrorMessages = {
  'Assessment not found.': 'Código de avaliação inválido.',
  'This assessment is still in draft status.': 'Esta avaliação ainda está em rascunho.',
  'This assessment has been cancelled.': 'Esta avaliação foi cancelada.',
  'This assessment has already been completed.': 'Esta avaliação já foi finalizada.',
  'This assessment is inactive.': 'Esta avaliação está inativa.',
  'This assessment is not available for answers.': 'Esta avaliação não está disponível para resposta.',
  'This assessment has expired.': 'Esta avaliação expirou.',
  'One or more questions do not belong to this assessment questionnaire.': 'Uma ou mais perguntas não pertencem ao questionário desta avaliação.',
  'All active questions must be answered before completing the assessment.': 'Todas as perguntas ativas precisam ser respondidas antes de finalizar a avaliação.',
  'The selected answer does not belong to this assessment.': 'A resposta selecionada não pertence a esta avaliação.',
  'The selected evidence does not belong to this answer.': 'A evidência selecionada não pertence a esta resposta.',
  'Only one evidence is allowed per answer.': 'Só é permitida uma evidência por resposta.',
}

function translatePublicAssessmentError(message, fallback) {
  return publicAssessmentErrorMessages[message] || fallback
}

function buildAnswersFromQuestions(questions) {
  return questions.reduce((answers, question) => ({
    ...answers,
    [question.id]: {
      score: question.answer?.score ? String(question.answer.score) : '',
      observation: question.answer?.observation || '',
    },
  }), {})
}

function closeCurrentTab() {
  window.close()

  window.setTimeout(() => {
    if (!window.closed) {
      window.alert('O navegador não permitiu fechar esta aba automaticamente. Você pode fechá-la manualmente.')
    }
  }, 250)
}

function PublicAssessmentAnswer() {
  const { accessCode } = useParams()
  const [payload, setPayload] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState({})
  const [uploadingQuestionId, setUploadingQuestionId] = useState(null)
  const [fileInputKeys, setFileInputKeys] = useState({})
  const [evidenceAlerts, setEvidenceAlerts] = useState({})

  const applyPayload = (nextPayload) => {
    setPayload(nextPayload)
    setAnswers(buildAnswersFromQuestions(nextPayload.questions || []))
  }

  const loadAssessment = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true)
    }

    try {
      const response = await api.get(`/public/assessments/${accessCode}`)
      applyPayload(response.data.data || response.data)
    } catch (error) {
      setAlert({
        type: 'danger',
        message: translatePublicAssessmentError(error.response?.data?.message, 'Não foi possível carregar a avaliação.'),
      })
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }, [accessCode])

  useEffect(() => {
    loadAssessment({ showLoading: true })
  }, [loadAssessment])

  const questionsByCategory = useMemo(() => {
    if (!payload?.questions) {
      return []
    }

    const groups = new Map()

    payload.questions.forEach((question) => {
      if (!groups.has(question.category)) {
        groups.set(question.category, [])
      }

      groups.get(question.category).push(question)
    })

    return Array.from(groups.entries())
  }, [payload])

  const updateAnswer = (questionId, field, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: {
        ...(currentAnswers[questionId] || {}),
        [field]: value,
      },
    }))
  }

  const buildPayload = () => ({
    answers: Object.entries(answers)
      .filter(([, answer]) => answer.score)
      .map(([questionId, answer]) => ({
        question_id: Number(questionId),
        score: Number(answer.score),
        observation: answer.observation || null,
      })),
  })

  const saveAnswers = async () => {
    setSaving(true)
    setAlert(null)

    try {
      const response = await api.post(`/public/assessments/${accessCode}/answers`, buildPayload())
      const nextPayload = response.data.data || response.data
      applyPayload(nextPayload)
      setAlert({ type: 'success', message: 'Respostas salvas com sucesso.' })

      if (window.confirm('Respostas salvas com sucesso. Deseja fechar esta aba?')) {
        closeCurrentTab()
      }
    } catch (error) {
      setAlert({
        type: 'danger',
        message: translatePublicAssessmentError(error.response?.data?.message, 'Não foi possível salvar as respostas.'),
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  const completeAssessment = async () => {
    if (!window.confirm('Deseja finalizar esta avaliação? Depois disso as respostas não poderão ser alteradas.')) {
      return
    }

    setSaving(true)
    setAlert(null)

    try {
      const response = await api.post(`/public/assessments/${accessCode}/complete`)
      const nextPayload = response.data.data || response.data
      applyPayload(nextPayload)
      setCompleted(true)
      setAlert({ type: 'success', message: 'Avaliação finalizada com sucesso.' })
      closeCurrentTab()
    } catch (error) {
      setAlert({
        type: 'danger',
        message: translatePublicAssessmentError(error.response?.data?.message, 'Não foi possível finalizar a avaliação.'),
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSelectedFiles = (questionId, files) => {
    setSelectedFiles((currentFiles) => ({
      ...currentFiles,
      [questionId]: Array.from(files || []),
    }))
    setEvidenceAlerts((currentAlerts) => ({
      ...currentAlerts,
      [questionId]: null,
    }))
  }

  const setEvidenceAlert = (questionId, type, message) => {
    setEvidenceAlerts((currentAlerts) => ({
      ...currentAlerts,
      [questionId]: { type, message },
    }))
  }

  const uploadEvidence = async (question) => {
    if (!question.answer?.id) {
      setEvidenceAlert(question.id, 'warning', 'Salve a resposta antes de anexar evidências.')
      return
    }

    const files = selectedFiles[question.id] || []

    if (question.answer?.evidences?.length > 0) {
      setEvidenceAlert(question.id, 'warning', 'Só é permitida uma evidência por resposta.')
      return
    }

    if (files.length === 0) {
      setEvidenceAlert(question.id, 'warning', 'Selecione ao menos uma imagem para enviar.')
      return
    }

    if (files.length > 1) {
      setEvidenceAlert(question.id, 'warning', 'Selecione apenas uma imagem.')
      return
    }

    const formData = new FormData()
    files.forEach((file) => formData.append('files[]', file))
    setUploadingQuestionId(question.id)
    setAlert(null)

    try {
      const response = await api.post(`/public/assessments/${accessCode}/answers/${question.answer.id}/evidences`, formData)
      applyPayload(response.data.data || response.data)
      setSelectedFiles((currentFiles) => ({ ...currentFiles, [question.id]: [] }))
      setFileInputKeys((currentKeys) => ({ ...currentKeys, [question.id]: (currentKeys[question.id] || 0) + 1 }))
      setEvidenceAlert(question.id, 'success', 'Evidência enviada com sucesso.')
    } catch (error) {
      const message = translatePublicAssessmentError(error.response?.data?.message, 'Não foi possível enviar a evidência.')
      setEvidenceAlert(question.id, 'danger', message)
      setAlert({
        type: 'danger',
        message,
        errors: error.response?.data?.errors,
      })
    } finally {
      setUploadingQuestionId(null)
    }
  }

  const deleteEvidence = async (question, evidence) => {
    if (!question.answer?.id || !evidence?.id) {
      return
    }

    setUploadingQuestionId(question.id)
    setAlert(null)

    try {
      const response = await api.delete(`/public/assessments/${accessCode}/answers/${question.answer.id}/evidences/${evidence.id}`)
      applyPayload(response.data.data || response.data)
      setEvidenceAlert(question.id, 'success', 'Evidência removida com sucesso.')
    } catch (error) {
      const message = translatePublicAssessmentError(error.response?.data?.message, 'Não foi possível remover a evidência.')
      setEvidenceAlert(question.id, 'danger', message)
      setAlert({
        type: 'danger',
        message,
      })
    } finally {
      setUploadingQuestionId(null)
    }
  }

  if (loading) {
    return <main className="container py-4"><Loading message="Carregando avaliação..." /></main>
  }

  const readOnly = completed || payload?.assessment?.status === 'COMPLETED'

  return (
    <main className="container py-4">
      <PageHeader
        title={payload?.assessment?.title || 'Responder Avaliação'}
        description={payload ? payload.questionnaire?.name || '-' : undefined}
        actions={payload && <StatusBadge status={payload.assessment?.status}>{getAssessmentStatusLabel(payload.assessment?.status)}</StatusBadge>}
      />

      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

      {!payload ? null : (
        <>
          <Card className="mb-4">
              <dl className="row mb-0">
                <dt className="col-sm-3">Organização</dt><dd className="col-sm-9">{payload.assessment.organization || '-'}</dd>
                <dt className="col-sm-3">Unidade</dt><dd className="col-sm-9">{payload.assessment.unit || '-'}</dd>
                <dt className="col-sm-3">Setor</dt><dd className="col-sm-9">{payload.assessment.sector || '-'}</dd>
                <dt className="col-sm-3">Pessoa</dt><dd className="col-sm-9">{payload.assessment.person || '-'}</dd>
                <dt className="col-sm-3">Expira em</dt><dd className="col-sm-9">{formatDateTime(payload.assessment.expires_at)}</dd>
              </dl>
          </Card>

          {questionsByCategory.map(([category, questions]) => (
            <section className="mb-4" key={category}>
              <h2 className="h5 mb-3">{getQuestionCategoryLabel(category)}</h2>
              <div className="vstack gap-3">
                {questions.map((question) => (
                  <Card key={question.id}>
                      <div className="d-flex gap-3">
                        <span className="badge text-bg-secondary align-self-start">{question.sort_order}</span>
                        <div className="flex-grow-1">
                          <p className="fw-semibold mb-1">{question.question}</p>
                          {question.description && <p className="text-secondary mb-3">{question.description}</p>}
                          <div className="vstack gap-3">
                            <div>
                              <fieldset disabled={readOnly || saving}>
                                <legend className="form-label fs-6">Pontuação</legend>
                                <div className="d-flex flex-wrap gap-3">
                                  {scoreOptions.map((option) => (
                                    <div className="form-check mb-0" key={option.value}>
                                      <input
                                        checked={answers[question.id]?.score === String(option.value)}
                                        className="form-check-input"
                                        id={`score_${question.id}_${option.value}`}
                                        name={`score_${question.id}`}
                                        type="radio"
                                        value={option.value}
                                        onChange={(event) => updateAnswer(question.id, 'score', event.target.value)}
                                      />
                                      <label className="form-check-label" htmlFor={`score_${question.id}_${option.value}`}>
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </div>
                            <div>
                              <label className="form-label" htmlFor={`observation_${question.id}`}>Observação</label>
                              <input
                                className="form-control"
                                disabled={readOnly || saving}
                                id={`observation_${question.id}`}
                                value={answers[question.id]?.observation || ''}
                                onChange={(event) => updateAnswer(question.id, 'observation', event.target.value)}
                              />
                            </div>
                            <div className="border-top pt-3">
                              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                <span className="fw-semibold">Evidências</span>
                                {!readOnly && (
                                  <small className="text-secondary">JPG, PNG ou WEBP até 5 MB.</small>
                                )}
                              </div>

                              {question.answer?.evidences?.length > 0 ? (
                                <div className="d-flex flex-wrap gap-3 mb-3">
                                  {question.answer.evidences.map((evidence) => (
                                    <div className="border rounded p-2" style={{ width: '140px' }} key={evidence.id}>
                                      <a href={evidence.url} target="_blank" rel="noreferrer">
                                        <img
                                          alt={evidence.original_name}
                                          className="img-fluid rounded mb-2"
                                          src={evidence.url}
                                          style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
                                        />
                                      </a>
                                      {!readOnly && (
                                        <button
                                          className="btn btn-outline-danger btn-sm w-100 mt-2"
                                          disabled={uploadingQuestionId === question.id}
                                          type="button"
                                          onClick={() => deleteEvidence(question, evidence)}
                                        >
                                          Remover
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-secondary mb-3">Nenhuma evidência enviada.</p>
                              )}

                              {!readOnly && !question.answer?.evidences?.length && (
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                  <input
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    className="form-control"
                                    key={fileInputKeys[question.id] || 0}
                                    style={{ maxWidth: '420px' }}
                                    type="file"
                                    onChange={(event) => updateSelectedFiles(question.id, event.target.files)}
                                  />
                                  <button
                                    className="btn btn-outline-primary"
                                    disabled={uploadingQuestionId === question.id}
                                    type="button"
                                    onClick={() => uploadEvidence(question)}
                                  >
                                    {uploadingQuestionId === question.id ? 'Enviando...' : 'Enviar evidência'}
                                  </button>
                                </div>
                              )}
                              {evidenceAlerts[question.id] && (
                                <div className={`alert alert-${evidenceAlerts[question.id].type} py-2 mt-3 mb-0`}>
                                  {evidenceAlerts[question.id].message}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          <FormActions>
            <button className="btn btn-outline-primary" type="button" disabled={readOnly || saving} onClick={saveAnswers}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button className="btn btn-primary" type="button" disabled={readOnly || saving} onClick={completeAssessment}>
              Finalizar
            </button>
          </FormActions>
        </>
      )}
    </main>
  )
}

export default PublicAssessmentAnswer
