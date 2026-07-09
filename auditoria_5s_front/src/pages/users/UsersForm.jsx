import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { ACCESS_LEVEL, ACCESS_LEVEL_OPTIONS } from '../../constants/accessLevels'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = {
  person_id: '',
  password: '',
  access_level: ACCESS_LEVEL.VIEWER,
  active: true,
}

function getPersonLabel(person) {
  return [person.name, person.email || person.phone || `ID: ${person.id}`].filter(Boolean).join(' - ')
}

function UsersForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedPeople, loadedUsers] = await Promise.all([fetchAllPages('/people'), fetchAllPages('/users')])
        let currentUser = null

        if (isEditing) {
          const userResponse = await api.get(`/users/${id}`)
          currentUser = userResponse.data.data || userResponse.data
          setForm({
            person_id: currentUser.person_id || '',
            password: '',
            access_level: currentUser.access_level || ACCESS_LEVEL.VIEWER,
            active: Boolean(currentUser.active),
          })
        }

        const unavailablePersonIds = new Set(
          loadedUsers
            .filter((user) => !currentUser || String(user.id) !== String(currentUser.id))
            .map((user) => String(user.person_id)),
        )

        setPeople(
          loadedPeople.filter(
            (person) =>
              (!unavailablePersonIds.has(String(person.id)) && person.active) ||
              String(person.id) === String(currentUser?.person_id),
          ),
        )
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do usuário.' })
      } finally {
        setLoading(false)
      }
    }

    loadFormData()
  }, [id, isEditing])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const buildPayload = () => {
    const payload = {
      person_id: form.person_id,
      access_level: Number(form.access_level),
      active: form.active,
    }

    if (form.password) {
      payload.password = form.password
    }

    return payload
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setAlert(null)

    try {
      if (isEditing) {
        await api.put(`/users/${id}`, buildPayload())
      } else {
        await api.post('/users', { ...buildPayload(), password: form.password })
      }

      navigate('/users', {
        state: { message: `Usuário ${isEditing ? 'atualizado' : 'criado'} com sucesso.` },
      })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível salvar o usuário.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando formulário de usuário..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Usuário' : 'Novo Usuário'} description="Vincule uma pessoa ao acesso do sistema." />

      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-8">
          <label className="form-label" htmlFor="person_id">
            Pessoa
          </label>
          <select className="form-select" id="person_id" name="person_id" value={form.person_id} onChange={updateField} required>
            <option value="">Selecione uma pessoa</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {getPersonLabel(person)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="access_level">
            Nível de acesso
          </label>
          <select
            className="form-select"
            id="access_level"
            name="access_level"
            value={form.access_level}
            onChange={updateField}
            required
          >
            {ACCESS_LEVEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="password">
            Senha
          </label>
          <input
            className="form-control"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required={!isEditing}
            placeholder={isEditing ? 'Deixe em branco para manter a senha atual' : ''}
          />
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" id="active" name="active" type="checkbox" checked={form.active} onChange={updateField} />
            <label className="form-check-label" htmlFor="active">
              Ativo
            </label>
          </div>
        </div>
        <FormActions>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <Link className="btn btn-outline-secondary" to="/users">
            Cancelar
          </Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  )
}

export default UsersForm
