import { fmtScore } from '@/lib/format'

export function ScoreBadge({ score, large = false }: { score: number | null; large?: boolean }) {
  if (score === null) {
    return (
      <span className="score-badge">
        <span className="text-sm font-medium">Sem nota</span>
      </span>
    )
  }

  return (
    <span className={large ? 'score-badge score-badge--lg' : 'score-badge'}>
      <span className="score-badge-value">{fmtScore(score)}</span>
      <span className="score-badge-unit">de 5</span>
    </span>
  )
}
