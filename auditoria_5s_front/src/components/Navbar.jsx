import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getAccessLevelLabel } from '../constants/accessLevels'
import NavbarMenu from './Menu/NavbarMenu'

function Navbar() {
  const navigate = useNavigate()
  const { can, isAuthenticated, logout, user } = useAuth()
  const personName = user?.name || 'User'
  const accessLevelName = getAccessLevelLabel(user?.access_level)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          Avaliação 5S
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Alternar navegação">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          {isAuthenticated && (
            <>
              <NavbarMenu can={can} onLogout={handleLogout} />
              <div className="d-flex align-items-center gap-3">
                <span className="navbar-text">{personName}</span>
                <span className="navbar-text">{accessLevelName}</span>
                <button className="btn btn-outline-light btn-sm" type="button" onClick={handleLogout}>Sair</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
