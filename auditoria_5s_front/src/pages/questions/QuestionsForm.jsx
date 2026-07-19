import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { fetchAllPages } from '../../utils/apiData'
import { nextAvailableSortOrder } from '../../utils/sortOrder'
import { getQuestionCategoryLabel } from './questionCategories'

const emptyForm = {
  questionnaire_id: '',
  category: '',
  question: '',
  description: '',
  sort_order: 1,
  active: true,
}

function QuestionsForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState({ ...emptyForm, questionnaire_id: searchParams.get('questionnaire_id') || '' })
  const [questionnaires, setQuestionnaires] = useState([])
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedQuestionnaires, loadedQuestions, categoriesResponse] = await Promise.all([
          fetchAllPages('/questionnaires'),
          fetchAllPages('/questions'),
          api.get('/questions/categories'),
        ])

        setQuestionnaires(loadedQuestionnaires)
        setQuestions(loadedQuestions)
        setCategories(categoriesResponse.data.data || categoriesResponse.data)

        if (isEditing) {
          const questionResponse = await api.get(`/questions/${id}`)
          const question = questionResponse.data.data || questionResponse.data
          setForm({
            questionnaire_id: String(question.questionnaire_id || ''),
            category: question.category || '',
            question: question.question || '',
            description: question.description || '',
            sort_order: question.sort_order || 1,
            active: Boolean(question.active),
          })
        } else if (searchParams.get('questionnaire_id')) {
          const questionnaireId = searchParams.get('questionnaire_id')
          const nextOrder = nextAvailableSortOrder(loadedQuestions.filter((question) => String(question.questionnaire_id) === String(questionnaireId)))

          setForm((currentForm) => ({ ...currentForm, questionnaire_id: questionnaireId, sort_order: nextOrder }))
        }
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados da pergunta.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing, searchParams])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: type === 'checkbox' ? checked : value }

      if (!isEditing && name === 'questionnaire_id') {
        nextForm.sort_order = value
          ? nextAvailableSortOrder(questions.filter((question) => String(question.questionnaire_id) === String(value)))
          : 1
      }

      return nextForm
    })
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    const payload = {
      ...form,
      description: form.description || null,
      sort_order: Number(form.sort_order),
    }

    try {
      if (isEditing) {
        await api.put(`/questions/${id}`, payload)
      } else {
        await api.post('/questions', payload)
      }

      const target = form.questionnaire_id ? `/questions?questionnaire_id=${form.questionnaire_id}` : '/questions'
      navigate(target, { state: { message: `Pergunta ${isEditing ? 'atualizada' : 'criada'} com sucesso.` } })
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Não foi possível salvar a pergunta.', errors: error.response?.data?.errors })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando pergunta..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Pergunta' : 'Nova Pergunta'} description="Vincule a pergunta a um questionário e informe sua categoria." />
      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />
      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-6">
          <label className="form-label" htmlFor="questionnaire_id">Questionário</label>
          <select className="form-select" id="questionnaire_id" name="questionnaire_id" value={form.questionnaire_id} onChange={updateField} required>
            <option value="">Selecione um questionário</option>
            {questionnaires.map((questionnaire) => (
              <option key={questionnaire.id} value={questionnaire.id}>{questionnaire.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="category">Categoria</label>
          <select className="form-select" id="category" name="category" value={form.category} onChange={updateField} required>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.code} value={category.code}>{getQuestionCategoryLabel(category.code)}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label" htmlFor="sort_order">Ordem</label>
          <input className="form-control" id="sort_order" min="1" name="sort_order" type="number" value={form.sort_order} onChange={updateField} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="question">Pergunta</label>
          <textarea className="form-control" id="question" name="question" value={form.question} onChange={updateField} rows="3" required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="description">Descrição</label>
          <textarea className="form-control" id="description" name="description" value={form.description} onChange={updateField} rows="3" />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
            <label className="form-check-label" htmlFor="active">Ativo</label>
          </div>
        </div>
        <FormActions>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          <Link className="btn btn-outline-secondary" to={form.questionnaire_id ? `/questions?questionnaire_id=${form.questionnaire_id}` : '/questions'}>Cancelar</Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  )
}

export default QuestionsForm
