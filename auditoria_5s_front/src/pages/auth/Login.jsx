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
      <div className="auth-card">
        <section className="auth-intro" aria-label="SSEP">
          <div>
            <div className="auth-brand">
              <span className="brand-mark brand-mark-large" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="brand-copy">
                <strong>SSEP</strong>
                <small>Sistema de Supervisão</small>
              </span>
            </div>
            <div className="auth-intro-copy">
              <span className="auth-eyebrow">Gestão de ambientes</span>
              <h1>Supervisão 5S simples, objetiva e confiável.</h1>
              <p>Acompanhe critérios, ambientes de trabalho e supervisões em um só lugar.</p>
            </div>
          </div>
          <div className="auth-senses" aria-label="Os cinco sensos">
            <span>Utilização</span>
            <span>Ordenação</span>
            <span>Limpeza</span>
            <span>Padronização</span>
            <span>Disciplina</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-header">
            <span className="auth-form-icon" aria-hidden="true"><i className="bi bi-shield-check" /></span>
            <h2>Bem-vindo</h2>
            <p>Informe suas credenciais para acessar o sistema.</p>
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
                placeholder="Digite seu login"
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
                placeholder="Digite sua senha"
                type="password"
                value={form.password}
                onChange={updateField}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
              <span>{submitting ? 'Entrando...' : 'Entrar no sistema'}</span>
              {!submitting && <i className="bi bi-arrow-right" aria-hidden="true" />}
            </button>
          </form>
          <p className="auth-support"><i className="bi bi-lock" aria-hidden="true" /> Acesso restrito a usuários autorizados</p>
        </section>
      </div>
    </main>
  )
}

export default Login
