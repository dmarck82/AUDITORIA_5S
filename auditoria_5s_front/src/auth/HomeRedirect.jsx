import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

const HOME_ROUTES = [
  { permission: 'supervisions.view', path: '/supervisions' },
  { permission: 'users.view', path: '/users' },
  { permission: 'local1s.view', path: '/local1s' },
  { permission: 'local2s.view', path: '/local2s' },
  { permission: 'local3s.view', path: '/local3s' },
  { permission: 'work_environments.view', path: '/work-environments' },
  { permission: 'verification_criteria.view', path: '/verification-criteria' },
  { permission: 'operators.view', path: '/operators' },
]

function HomeRedirect() {
  const { can } = useAuth()
  const route = HOME_ROUTES.find((item) => can(item.permission))

  return <Navigate to={route?.path || '/login'} replace />
}

export default HomeRedirect
