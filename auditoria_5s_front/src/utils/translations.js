const fieldLabels = {
  access_level: 'Nível de acesso',
  active: 'Ativo',
  'answers.*.evidence': 'Evidência',
  'answers.*.not_applicable': 'Não aplicável',
  'answers.*.observation': 'Observação',
  'answers.*.selected_value': 'Resposta',
  code: 'Código',
  description: 'Descrição',
  email: 'E-mail',
  job_title: 'Cargo',
  local_1_id: 'Organização',
  local_2_id: 'Setor/OMDS',
  local_3_id: 'Subsetor/Seção',
  login: 'Login',
  name: 'Nome',
  password: 'Senha',
  phone: 'Celular',
  question: 'Pergunta',
  response_0_label: 'Resposta de 0 pontos',
  response_5_label: 'Resposta de 5 pontos',
  response_10_label: 'Resposta de 10 pontos',
  response_15_label: 'Resposta de 15 pontos',
  responsible_user_id: 'Usuário responsável',
  sense: 'Senso 5S',
  user_id: 'Usuário',
  work_environment_id: 'Ambiente de Trabalho',
}

const messageTranslations = {
  'A not applicable answer cannot have a numeric value.': 'Uma resposta não aplicável não pode possuir valor numérico.',
  'An applicable answer must have a numeric value.': 'Selecione uma resposta para o critério aplicável.',
  'At least one active verification criterion is required.': 'Cadastre ao menos um Critério de Verificação ativo antes de iniciar uma supervisão.',
  'All criteria must be answered before finalization.': 'Todos os critérios devem ser respondidos antes da finalização.',
  'Finalized supervisions cannot be changed.': 'Supervisões finalizadas não podem ser alteradas.',
  'Observation is required for answers with value 0 or 5.': 'A observação é obrigatória para respostas de 0 ou 5 pontos.',
  'The answer does not belong to this supervision.': 'A resposta não pertence a esta supervisão.',
  'A local3 cannot be selected without a local2.': 'Um subsetor/seção não pode ser selecionado sem um Setor/OMDS.',
  'A operator can only be created for an active user.': 'Um operador só pode ser criado para um usuário ativo.',
  'A operator can only be linked to an active user.': 'Um operador só pode ser vinculado a um usuário ativo.',
  'Invalid credentials': 'Credenciais inválidas.',
  'Successfully logged out': 'Sessão encerrada com sucesso.',
  'The selected local2 does not belong to the selected local1.': 'O Setor/OMDS selecionado não pertence à organização selecionada.',
  'The selected local3 does not belong to the selected local2.': 'O subsetor/seção selecionado não pertence ao Setor/OMDS selecionado.',
  'This local1 cannot be deleted because it has local2s.': 'Esta organização não pode ser excluída porque possui Setores/OMDS.',
  'This local1 cannot be deleted because it has users linked to it.': 'Esta organização não pode ser excluída porque possui usuários vinculados.',
  'This local2 cannot be deleted because it has local3s.': 'Este Setor/OMDS não pode ser excluído porque possui subsetores/seções.',
  'This local2 cannot be deleted because it has users linked to it.': 'Este Setor/OMDS não pode ser excluído porque possui usuários vinculados.',
  'This local3 cannot be deleted because it has users linked to it.': 'Este subsetor/seção não pode ser excluído porque possui usuários vinculados.',
  'This local3 cannot be deleted because it has work environments linked to it.': 'Este subsetor/seção não pode ser excluído porque possui ambientes de trabalho vinculados.',
  'Token was not returned by the API.': 'A API não retornou o token de autenticação.',
  'Too Many Attempts.': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  'Unauthenticated.': 'Sessão expirada ou não autenticada.',
  'Unable to sign in.': 'Não foi possível entrar.',
  'You do not have permission to access this resource.': 'Você não tem permissão para acessar este recurso.',
}

export function translateField(field) {
  const normalizedField = String(field || '').replace(/\.\d+\./g, '.*.').replace(/\.\d+$/g, '.*')
  return fieldLabels[normalizedField] || fieldLabels[field] || field
}

export function translateMessage(message) {
  if (!message) return message
  if (messageTranslations[message]) return messageTranslations[message]

  const fieldName = (field) => translateField(field.replaceAll(' ', '_'))
  const validationPatterns = [
    [/^The (.+) field is required\.$/, (field) => `${fieldName(field)} é obrigatório.`],
    [/^The (.+) field must be a string\.$/, (field) => `${fieldName(field)} deve ser um texto.`],
    [/^The (.+) field must be an integer\.$/, (field) => `${fieldName(field)} deve ser um número inteiro.`],
    [/^The (.+) field must be true or false\.$/, (field) => `${fieldName(field)} deve ser verdadeiro ou falso.`],
    [/^The (.+) field must be an image\.$/, (field) => `${fieldName(field)} deve ser uma imagem.`],
    [/^The (.+) field must not be greater than (.+) characters\.$/, (field, max) => `${fieldName(field)} não pode ter mais que ${max} caracteres.`],
    [/^The (.+) field must not be greater than (.+) kilobytes\.$/, (field, max) => `${fieldName(field)} não pode ter mais que ${max} KB.`],
    [/^The (.+) field must be at least (.+) characters\.$/, (field, min) => `${fieldName(field)} deve ter pelo menos ${min} caracteres.`],
    [/^The (.+) field must be (.+) digits\.$/, (field, digits) => `${fieldName(field)} deve ter ${digits} dígitos.`],
    [/^The (.+) field must be a valid email address\.$/, (field) => `${fieldName(field)} deve ser um e-mail válido.`],
    [/^The (.+) has already been taken\.$/, (field) => `${fieldName(field)} já está em uso.`],
    [/^The selected (.+) is invalid\.$/, (field) => `A seleção de ${fieldName(field)} é inválida.`],
  ]

  for (const [pattern, translator] of validationPatterns) {
    const match = message.match(pattern)
    if (match) return translator(...match.slice(1))
  }

  return message
}
