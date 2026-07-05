import { NavLink } from 'react-router-dom'

const menuItems = [
  {
    label: 'Início',
    path: '/',
  },
  {
    label: 'Cadastros',
    items: [
      { label: 'Organizações', path: '/organizations', permission: 'organizations.view' },
      { label: 'Unidades', path: '/units', permission: 'units.view' },
      { label: 'Setores', path: '/sectors', permission: 'sectors.view' },
      { label: 'Pessoas', path: '/people', permission: 'people.view' },
      { label: 'Usuários', path: '/users', permission: 'users.view' },
      { label: 'Questionários', path: '/questionnaires', permission: 'questionnaires.view' },
      { label: 'Perguntas', path: '/questions', permission: 'questions.view' },
    ],
  },
  {
    label: 'Avaliações',
    items: [
      { label: 'Avaliações', path: '/assessments', permission: 'assessments.view' },
      { label: 'Perguntas', disabled: true },
      { label: 'Respostas', disabled: true },
      { label: 'Evidências', disabled: true },
    ],
  },
  {
    label: 'Relatórios',
    items: [
      { label: 'Dashboard 5S', disabled: true },
      { label: 'Indicadores', disabled: true },
      { label: 'Ranking de Setores', disabled: true },
      { label: 'Não Conformidades', disabled: true },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Meu Perfil', disabled: true },
      { label: 'Configurações', disabled: true },
      { label: 'Labels da Organização', disabled: true },
      { label: 'Tabelas Genéricas', disabled: true },
      { label: 'Logs do Sistema', disabled: true },
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

function DropdownMenu({ group, can }) {
  const visibleItems = group.items.filter((item) => item.disabled || !item.permission || can(item.permission))

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <li className="nav-item dropdown">
      <button
        className="nav-link dropdown-toggle btn btn-link"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {group.label}
      </button>
      <ul className="dropdown-menu">
        {visibleItems.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <DisabledMenuItem label={item.label} />
            ) : (
              <NavLink className="dropdown-item" to={item.path}>
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </li>
  )
}

function NavbarMenu({ can }) {
  return (
    <ul className="navbar-nav me-auto">
      {menuItems.map((item) => {
        if (item.items) {
          return <DropdownMenu key={item.label} group={item} can={can} />
        }

        return (
          <li className="nav-item" key={item.label}>
            <NavLink className="nav-link" to={item.path}>
              {item.label}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

export default NavbarMenu
