export function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '')
}

export function formatPhone(value = '') {
  const digits = onlyDigits(value).slice(0, 11)
  const areaCode = digits.slice(0, 2)
  const firstPart = digits.slice(2, 7)
  const secondPart = digits.slice(7, 11)

  if (digits.length <= 2) {
    return areaCode ? `(${areaCode}` : ''
  }

  if (digits.length <= 7) {
    return `(${areaCode}) ${firstPart}`
  }

  return `(${areaCode}) ${firstPart}-${secondPart}`
}

export function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
