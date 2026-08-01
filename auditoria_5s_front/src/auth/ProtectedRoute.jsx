import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Loading from '../components/Loading'
import { useAuth } from './useAuth'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <main className="container py-4">
        <Loading message="Verificando autenticação..." />
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
