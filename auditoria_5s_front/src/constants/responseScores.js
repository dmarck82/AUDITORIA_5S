export const RESPONSE_SCORES = [
  { value: 0, field: 'response_0_label', defaultLabel: 'Não atende ao requisito' },
  { value: 5, field: 'response_5_label', defaultLabel: 'Atende parcialmente, com falhas relevantes' },
  { value: 10, field: 'response_10_label', defaultLabel: 'Atende, com pequenas oportunidades de melhoria' },
  { value: 15, field: 'response_15_label', defaultLabel: 'Atende plenamente ao padrão estabelecido' },
]

export const DEFAULT_RESPONSE_LABELS = Object.fromEntries(
  RESPONSE_SCORES.map((score) => [score.field, score.defaultLabel]),
)
