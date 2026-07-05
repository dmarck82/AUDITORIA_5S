import { Outlet } from 'react-router-dom'
import HomeRedirect from './HomeRedirect'
import { useAuth } from './useAuth'

function PermissionRoute({ permission }) {
  const { can } = useAuth()

  if (!can(permission)) {
    return <HomeRedirect />
  }

  return <Outlet />
}

export default PermissionRoute
