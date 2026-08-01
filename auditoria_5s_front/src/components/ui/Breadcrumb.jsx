import { Link } from 'react-router-dom'

function Breadcrumb({ items = [] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav className="app-breadcrumb" aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li className={`breadcrumb-item ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined} key={`${item.label}-${index}`}>
              {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : item.label}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
