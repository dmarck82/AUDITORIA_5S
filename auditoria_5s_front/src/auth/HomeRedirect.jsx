import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

const HOME_ROUTES = [
  { permission: 'people.view', path: '/people' },
  { permission: 'organizations.view', path: '/organizations' },
  { permission: 'units.view', path: '/units' },
  { permission: 'sectors.view', path: '/sectors' },
  { permission: 'users.view', path: '/users' },
]

function HomeRedirect() {
  const { can } = useAuth()
  const route = HOME_ROUTES.find((item) => can(item.permission))

  return <Navigate to={route?.path || '/login'} replace />
}

export default HomeRedirect
