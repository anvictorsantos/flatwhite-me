'use client'

import { useState } from 'react'
import { Sheet } from '@/components/Sheet'
import type { Filters } from '@/lib/filters'

type Option = { value: string; label: string }

function OptionRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly Option[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? 'chip chip-active' : 'chip'}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FiltersSheet({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean
  filters: Filters
  onClose: () => void
  onApply: (filters: Filters) => void
}) {
  const [draft, setDraft] = useState<Filters>(filters)

  return (
    <Sheet
      open={open}
      title="Filtros"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => onApply(draft)}
        >
          Mostrar cafés
        </button>
      }
    >
      <div className="grid gap-4">
        <h3 className="display-sm">À tua medida.</h3>
        <p className="lede">Filtra por nota, preço e especialidade.</p>

        <label className="field">
          <span>Pesquisar café ou bairro</span>
          <input
            className="input"
            type="search"
            value={draft.query}
            placeholder="Pesquisar café ou bairro"
            onChange={(event) => setDraft({ ...draft, query: event.target.value })}
          />
        </label>

        <OptionRow
          label="Nota mínima"
          value={draft.minScore}
          onChange={(value) => setDraft({ ...draft, minScore: value as Filters['minScore'] })}
          options={[
            { value: 'all', label: 'Todas' },
            { value: '4.5', label: '4,5+' },
            { value: '4.6', label: '4,6+' },
          ]}
        />
        <OptionRow
          label="Preço"
          value={draft.price}
          onChange={(value) => setDraft({ ...draft, price: value as Filters['price'] })}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'up3', label: 'Até 3 €' },
            { value: '3to4', label: '3–4 €' },
          ]}
        />
        <OptionRow
          label="Especialidade"
          value={draft.specialty}
          onChange={(value) => setDraft({ ...draft, specialty: value as Filters['specialty'] })}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'specialty', label: 'Só especialidade' },
          ]}
        />
      </div>
    </Sheet>
  )
}
