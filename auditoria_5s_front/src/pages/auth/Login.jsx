import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AlertMessage from '../../components/AlertMessage'
import Loading from '../../components/Loading'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, login } = useAuth()
  const [form, setForm] = useState({
    login: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState(null)

  const redirectTo = location.state?.from?.pathname || '/'

  if (loading) {
    return (
      <main className="auth-page">
        <Loading message="Verificando autenticação..." />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setAlert(null)

    try {
      await login(form)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || error.message || 'Não foi possível entrar.',
        errors: error.response?.data?.errors,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="card auth-card">
        <div className="card-body">
          <div className="mb-4 text-center">
            <h1 className="h3 mb-1">Avaliação 5S</h1>
            <p className="text-secondary">Entre para continuar</p>
          </div>

          <AlertMessage type={alert?.type} message={alert?.message} errors={alert?.errors} />

          <form className="d-grid gap-3" onSubmit={submitForm}>
            <div>
              <label className="form-label" htmlFor="login">
                Login
              </label>
              <input
                className="form-control"
                id="login"
                name="login"
                value={form.login}
                onChange={updateField}
                autoComplete="username"
                required
              />
            </div>

            <div>
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
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

export default Login
