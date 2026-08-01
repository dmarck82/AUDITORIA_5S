import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getAccessLevelLabel } from '../constants/accessLevels'
import NavbarMenu from './Menu/NavbarMenu'

function Navbar() {
  const navigate = useNavigate()
  const { can, isAuthenticated, logout, operator } = useAuth()
  const operatorName = operator?.name || 'Operator'
  const accessLevelName = getAccessLevelLabel(operator?.access_level)
  const operatorInitial = operatorName.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'O'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="app-navbar navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className="brand-copy">
            <strong>SSEP</strong>
            <small>Supervisão 5S</small>
          </span>
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Alternar navegação">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          {isAuthenticated && (
            <>
              <NavbarMenu can={can} onLogout={handleLogout} />
              <div className="operator-area">
                <span className="operator-avatar" aria-hidden="true">{operatorInitial}</span>
                <span className="operator-details">
                  <strong>{operatorName}</strong>
                  <small>{accessLevelName}</small>
                </span>
                <button className="navbar-logout btn btn-outline-light btn-sm" type="button" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
