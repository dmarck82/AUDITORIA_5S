const fieldLabels = {
  active: 'Ativo',
  access_level: 'Nível de acesso',
  'answers': 'Respostas',
  'answers.*.observation': 'Observação',
  'answers.*.question_id': 'Pergunta',
  'answers.*.score': 'Pontuação',
  category: 'Categoria',
  description: 'Descrição',
  email: 'E-mail',
  expires_at: 'Expira em',
  files: 'Arquivos',
  'files.*': 'Arquivo',
  job_title: 'Cargo',
  login: 'Login',
  name: 'Nome',
  observation: 'Observação',
  organization_id: 'Organização',
  password: 'Senha',
  person_id: 'Pessoa',
  phone: 'Celular',
  question: 'Pergunta',
  questionnaire_id: 'Questionário',
  score: 'Pontuação',
  sector_id: 'Setor',
  sort_order: 'Ordem',
  status: 'Status',
  title: 'Título',
  unit_id: 'Unidade',
}

const messageTranslations = {
  'A sector cannot be selected without a unit.': 'Um setor não pode ser selecionado sem uma unidade.',
  'A user can only be created for an active person.': 'Um usuário só pode ser criado para uma pessoa ativa.',
  'A user can only be linked to an active person.': 'Um usuário só pode ser vinculado a uma pessoa ativa.',
  'All active questions must be answered before completing the assessment.': 'Todas as perguntas ativas precisam ser respondidas antes de finalizar a avaliação.',
  'Assessment not found.': 'Código de avaliação inválido.',
  'Completed assessments cannot be deleted.': 'Avaliações concluídas não podem ser excluídas.',
  'Invalid credentials': 'Credenciais inválidas.',
  'One or more questions do not belong to this assessment questionnaire.': 'Uma ou mais perguntas não pertencem ao questionário desta avaliação.',
  'Only one evidence is allowed per answer.': 'Só é permitida uma evidência por resposta.',
  'Successfully logged out': 'Sessão encerrada com sucesso.',
  'The questionnaire cannot be changed after the assessment leaves draft status.': 'O questionário não pode ser alterado depois que a avaliação sair do rascunho.',
  'The selected category is invalid.': 'A categoria selecionada é inválida.',
  'The selected answer does not belong to this assessment.': 'A resposta selecionada não pertence a esta avaliação.',
  'The selected evidence does not belong to this answer.': 'A evidência selecionada não pertence a esta resposta.',
  'The selected organization must be active.': 'A organização selecionada deve estar ativa.',
  'The selected person does not belong to the selected organization.': 'A pessoa selecionada não pertence à organização selecionada.',
  'The selected person is not compatible with the selected sector.': 'A pessoa selecionada não é compatível com o setor selecionado.',
  'The selected person is not compatible with the selected unit.': 'A pessoa selecionada não é compatível com a unidade selecionada.',
  'The selected person must be active.': 'A pessoa selecionada deve estar ativa.',
  'The selected questionnaire must be active.': 'O questionário selecionado deve estar ativo.',
  'The selected sector does not belong to the selected unit.': 'O setor selecionado não pertence à unidade selecionada.',
  'The selected status is invalid.': 'O status selecionado é inválido.',
  'The selected unit does not belong to the selected organization.': 'A unidade selecionada não pertence à organização selecionada.',
  'This assessment has already been completed.': 'Esta avaliação já foi finalizada.',
  'This assessment has been cancelled.': 'Esta avaliação foi cancelada.',
  'This assessment has expired.': 'Esta avaliação expirou.',
  'This assessment is inactive.': 'Esta avaliação está inativa.',
  'This assessment is not available for answers.': 'Esta avaliação não está disponível para resposta.',
  'This assessment is still in draft status.': 'Esta avaliação ainda está em rascunho.',
  'This organization cannot be deleted because it has people linked to it.': 'Esta organização não pode ser excluída porque possui pessoas vinculadas.',
  'This organization cannot be deleted because it has units.': 'Esta organização não pode ser excluída porque possui unidades.',
  'This questionnaire cannot be deleted because it has questions.': 'Este questionário não pode ser excluído porque possui perguntas.',
  'This sector cannot be deleted because it has people linked to it.': 'Este setor não pode ser excluído porque possui pessoas vinculadas.',
  'This unit cannot be deleted because it has people linked to it.': 'Esta unidade não pode ser excluída porque possui pessoas vinculadas.',
  'This unit cannot be deleted because it has sectors.': 'Esta unidade não pode ser excluída porque possui setores.',
  'Token was not returned by the API.': 'A API não retornou o token de autenticação.',
  'Too Many Attempts.': 'Muitas tentativas. Aguarde um momento e tente novamente.',
  'Unauthenticated.': 'Sessão expirada ou não autenticada.',
  'Unable to sign in.': 'Não foi possível entrar.',
  'You do not have permission to access this resource.': 'Você não tem permissão para acessar este recurso.',
}

export function translateField(field) {
  const normalizedField = String(field || '')
    .replace(/\.\d+\./g, '.*.')
    .replace(/\.\d+$/g, '.*')

  return fieldLabels[normalizedField] || fieldLabels[field] || field
}

export function translateMessage(message) {
  if (!message) {
    return message
  }

  if (messageTranslations[message]) {
    return messageTranslations[message]
  }

  const fieldName = (field) => translateField(field.replaceAll(' ', '_'))
  const validationPatterns = [
    [/^The (.+) field is required\.$/, (field) => `${fieldName(field)} é obrigatório.`],
    [/^The (.+) field must be a string\.$/, (field) => `${fieldName(field)} deve ser um texto.`],
    [/^The (.+) field must be an integer\.$/, (field) => `${fieldName(field)} deve ser um número inteiro.`],
    [/^The (.+) field must be true or false\.$/, (field) => `${fieldName(field)} deve ser verdadeiro ou falso.`],
    [/^The (.+) field must be a date\.$/, (field) => `${fieldName(field)} deve ser uma data válida.`],
    [/^The (.+) field must be an image\.$/, (field) => `${fieldName(field)} deve ser uma imagem.`],
    [/^The (.+) field must not be greater than (.+) characters\.$/, (field, max) => `${fieldName(field)} não pode ter mais que ${max} caracteres.`],
    [/^The (.+) field must not be greater than (.+) kilobytes\.$/, (field, max) => `${fieldName(field)} não pode ter mais que ${max} KB.`],
    [/^The (.+) field must not have more than (.+) items\.$/, (field, max) => `${fieldName(field)} não pode ter mais que ${max} item(ns).`],
    [/^The (.+) field must be at least (.+) characters\.$/, (field, min) => `${fieldName(field)} deve ter pelo menos ${min} caracteres.`],
    [/^The (.+) field must be at least (.+)\.$/, (field, min) => `${fieldName(field)} deve ser pelo menos ${min}.`],
    [/^The (.+) field must be between (.+) and (.+)\.$/, (field, min, max) => `${fieldName(field)} deve estar entre ${min} e ${max}.`],
    [/^The (.+) field must be (.+) digits\.$/, (field, digits) => `${fieldName(field)} deve ter ${digits} dígitos.`],
    [/^The (.+) field must be a valid email address\.$/, (field) => `${fieldName(field)} deve ser um e-mail válido.`],
    [/^The (.+) has already been taken\.$/, (field) => `${fieldName(field)} já está em uso.`],
    [/^The selected (.+) is invalid\.$/, (field) => `A seleção de ${fieldName(field)} é inválida.`],
  ]

  for (const [pattern, translator] of validationPatterns) {
    const match = message.match(pattern)

    if (match) {
      return translator(...match.slice(1))
    }
  }

  return message
}
