export function statusLabel(ratings: number): { text: string; className: string } {
  if (ratings >= 3) return { text: 'No ranking', className: 'text-success' }
  if (ratings > 0) return { text: 'Poucas avaliações', className: 'text-warning' }
  return { text: 'Ainda sem avaliações', className: 'text-success' }
}
