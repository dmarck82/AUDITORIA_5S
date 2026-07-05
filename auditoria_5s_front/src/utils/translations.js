const fieldLabels = {
  active: 'Ativo',
  email: 'E-mail',
  job_title: 'Cargo',
  login: 'Login',
  name: 'Nome',
  organization_id: 'Organização',
  password: 'Senha',
  person_id: 'Pessoa',
  phone: 'Celular',
  sector_id: 'Setor',
  unit_id: 'Unidade',
}

const messageTranslations = {
  'Invalid credentials': 'Credenciais inválidas.',
  'Token was not returned by the API.': 'A API não retornou o token de autenticação.',
  'Unable to sign in.': 'Não foi possível entrar.',
}

export function translateField(field) {
  return fieldLabels[field] || field
}

export function translateMessage(message) {
  if (!message) {
    return message
  }

  return messageTranslations[message] || message
}
