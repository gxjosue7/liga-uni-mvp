import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'

export interface FilterFieldSpec {
  name: string
  label: string
  type: 'select' | 'date' | 'search'
  value: string
  options?: { value: string; label: string }[]
}

interface FilterFormProps {
  label: string
  fields: FilterFieldSpec[]
  resetHref: string
}

const controlClass = 'block min-h-11 w-full rounded border border-line-strong bg-surface px-3 text-base md:min-h-10 md:text-sm'

// Formulário GET: os filtros ficam na URL e o servidor consulta só o que foi pedido.
export function FilterForm({ label, fields, resetHref }: FilterFormProps) {
  return (
    <form method="get" aria-label={label} className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 md:p-5 lg:grid-cols-4">
      {fields.map((field) => (
        <label key={field.name} className="space-y-1.5 text-sm font-semibold">
          {field.label}
          {field.type === 'select' ? (
            <select name={field.name} defaultValue={field.value} className={controlClass}>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type}
              defaultValue={field.value}
              className={controlClass}
              maxLength={field.type === 'search' ? 80 : undefined}
            />
          )}
        </label>
      ))}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4 lg:justify-end">
        <button type="submit" className={buttonClass('primary', 'md', 'flex-1 lg:flex-none')}>Filtrar</button>
        <Link href={resetHref} className={buttonClass('secondary', 'md')}>Limpar</Link>
      </div>
    </form>
  )
}
