import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'
import { FormActions, FormSection, PageHeader } from '../../components/ui'
import { ACCESS_LEVEL, ACCESS_LEVEL_OPTIONS } from '../../constants/accessLevels'
import { fetchAllPages } from '../../utils/apiData'

const emptyForm = {
  user_id: '',
  password: '',
  access_level: ACCESS_LEVEL.VIEWER,
  active: true,
}

function getUserLabel(user) {
  return [user.name, user.email || user.phone || `ID: ${user.id}`].filter(Boolean).join(' - ')
}

function OperatorsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [loadedUsers, loadedOperators] = await Promise.all([fetchAllPages('/users'), fetchAllPages('/operators')])
        let currentUser = null

        if (isEditing) {
          const userResponse = await api.get(`/operators/${id}`)
          currentUser = userResponse.data.data || userResponse.data
          setForm({
            user_id: currentUser.user_id || '',
            password: '',
            access_level: currentUser.access_level || ACCESS_LEVEL.VIEWER,
            active: Boolean(currentUser.active),
          })
        }

        const unavailableUserIds = new Set(
          loadedOperators
            .filter((operator) => !currentUser || String(operator.id) !== String(currentUser.id))
            .map((operator) => String(operator.user_id)),
        )

        setUsers(
          loadedUsers.filter(
            (user) =>
              (!unavailableUserIds.has(String(user.id)) && user.active) ||
              String(user.id) === String(currentUser?.user_id),
          ),
        )
      } catch {
        setAlert({ type: 'danger', message: 'Não foi possível carregar os dados do operador.' })
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
      user_id: form.user_id,
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
        await api.put(`/operators/${id}`, buildPayload())
      } else {
        await api.post('/operators', { ...buildPayload(), password: form.password })
      }

      navigate('/operators', {
        state: { message: `Operador ${isEditing ? 'atualizado' : 'criado'} com sucesso.` },
      })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Não foi possível salvar o operador.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading message="Carregando formulário de operador..." />
  }

  return (
    <section>
      <PageHeader title={isEditing ? 'Editar Operador' : 'Novo Operador'} description="Vincule um usuário ao acesso do sistema." />

      <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

      <FormSection>
      <form className="row g-3" onSubmit={submitForm}>
        <div className="col-md-8">
          <label className="form-label" htmlFor="user_id">
            Usuário
          </label>
          <select className="form-select" id="user_id" name="user_id" value={form.user_id} onChange={updateField} required>
            <option value="">Selecione um usuário</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {getUserLabel(user)}
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
          <Link className="btn btn-outline-secondary" to="/operators">
            Cancelar
          </Link>
        </FormActions>
      </form>
      </FormSection>
    </section>
  )
}

export default OperatorsForm
