export const FIVE_S_SENSES = [
  { value: 'utilization', label: 'Utilização' },
  { value: 'ordering', label: 'Ordenação' },
  { value: 'cleaning', label: 'Limpeza' },
  { value: 'standardization', label: 'Padronização' },
  { value: 'discipline', label: 'Disciplina' },
]

export function getFiveSSenseLabel(value) {
  return FIVE_S_SENSES.find((sense) => sense.value === value)?.label || value || '-'
}
