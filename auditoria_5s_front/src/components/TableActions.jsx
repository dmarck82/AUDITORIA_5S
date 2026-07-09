import { Link } from 'react-router-dom'

const actionIcons = {
  answer: 'bi-box-arrow-up-right',
  delete: 'bi-trash',
  edit: 'bi-pencil',
  questions: 'bi-list-check',
  view: 'bi-eye',
}

const actionVariants = {
  delete: 'outline-danger',
  edit: 'outline-primary',
  default: 'outline-secondary',
}

function TableActions({ actions }) {
  const visibleActions = actions.filter(Boolean)

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <div className="btn-group btn-group-sm">
      {visibleActions.map((action) => {
        const className = `btn btn-${action.variant || actionVariants[action.type] || actionVariants.default}`
        const icon = action.icon || actionIcons[action.type]
        const content = <i className={`bi ${icon}`} aria-hidden="true" />
        const commonProps = {
          'aria-label': action.label,
          className,
          title: action.label,
        }

        if (action.to) {
          return (
            <Link key={action.key || action.label} {...commonProps} state={action.state} target={action.target} to={action.to}>
              {content}
            </Link>
          )
        }

        return (
          <button key={action.key || action.label} {...commonProps} type="button" onClick={action.onClick}>
            {content}
          </button>
        )
      })}
    </div>
  )
}

export default TableActions
