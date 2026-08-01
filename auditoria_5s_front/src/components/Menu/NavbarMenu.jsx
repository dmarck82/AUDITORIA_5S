import { NavLink } from 'react-router-dom'
import { registrationItems } from '../../constants/registrations'

const menuItems = [
  { label: 'Início', path: '/' },
  { label: 'Cadastros', path: '/cadastros', permissions: registrationItems.map((item) => item.permission) },
  { label: 'Supervisões', path: '/supervisions', permission: 'supervisions.view' },
  {
    label: 'Sistema',
    items: [
      { label: 'Meu Perfil', disabled: true },
      { label: 'Configurações', disabled: true },
      { label: 'Sair', action: 'logout' },
    ],
  },
]

function DisabledMenuItem({ label }) {
  return (
    <span className="dropdown-item disabled d-flex align-items-center justify-content-between gap-3" aria-disabled="true">
      <span>{label}</span>
      <small className="text-secondary">Em breve</small>
    </span>
  )
}

function DropdownMenu({ group, can, onLogout }) {
  const visibleItems = group.items.filter((item) => item.disabled || !item.permission || can(item.permission))

  if (visibleItems.length === 0) return null

  return (
    <li className="nav-item dropdown">
      <button className="nav-link dropdown-toggle btn btn-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        {group.label}
      </button>
      <ul className="dropdown-menu">
        {visibleItems.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <DisabledMenuItem label={item.label} />
            ) : item.action === 'logout' ? (
              <button className="dropdown-item" type="button" onClick={onLogout}>{item.label}</button>
            ) : (
              <NavLink className="dropdown-item" to={item.path}>{item.label}</NavLink>
            )}
          </li>
        ))}
      </ul>
    </li>
  )
}

function NavbarMenu({ can, onLogout }) {
  const canViewItem = (item) => (!item.permission || can(item.permission))
    && (!item.permissions || item.permissions.some((permission) => can(permission)))

  return (
    <ul className="navbar-nav me-auto">
      {menuItems.filter(canViewItem).map((item) => item.items ? (
        <DropdownMenu key={item.label} group={item} can={can} onLogout={onLogout} />
      ) : (
        <li className="nav-item" key={item.label}>
          <NavLink className="nav-link" to={item.path}>{item.label}</NavLink>
        </li>
      ))}
    </ul>
  )
}

export default NavbarMenu
