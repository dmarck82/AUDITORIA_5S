import { translateField, translateMessage } from '../utils/translations'

function AlertMessage({ type = 'info', message, errors }) {
  if (!message && !errors) {
    return null
  }

  const validationErrors = errors
    ? Object.entries(errors).flatMap(([field, messages]) =>
        Array.isArray(messages)
          ? messages.map((item) => `${translateField(field)}: ${translateMessage(item)}`)
          : [`${translateField(field)}: ${translateMessage(messages)}`],
      )
    : []

  return (
    <div className={`alert alert-${type}`} role="alert">
      {message && <div>{translateMessage(message)}</div>}
      {validationErrors.length > 0 && (
        <ul className="mb-0 mt-2">
          {validationErrors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AlertMessage
