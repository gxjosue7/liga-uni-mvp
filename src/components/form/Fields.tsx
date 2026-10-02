'use client'

import { useId } from 'react'

import { useFieldErrors } from '@/components/form/ActionForm'
import { cn } from '@/lib/utils'

const controlClass =
  'block w-full rounded border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted md:text-sm ' +
  'min-h-11 md:min-h-10 aria-[invalid=true]:border-danger'

interface FieldShellProps {
  id: string
  label: string
  name: string
  hint?: string
  isRequired?: boolean
  children: (aria: { 'aria-describedby'?: string; 'aria-invalid': boolean }) => React.ReactNode
}

function FieldShell({ id, label, name, hint, isRequired, children }: FieldShellProps) {
  const errors = useFieldErrors(name)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, errors.length ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {isRequired ? <span aria-hidden="true" className="text-danger"> *</span> : null}
      </label>
      {children({ 'aria-describedby': describedBy || undefined, 'aria-invalid': errors.length > 0 })}
      {hint ? <p id={hintId} className="text-xs text-ink-muted">{hint}</p> : null}
      {errors.length ? <p id={errorId} className="text-xs font-medium text-danger">{errors[0]}</p> : null}
    </div>
  )
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  hint?: string
}

export function TextField({ label, name, hint, className, required, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} name={name} hint={hint} isRequired={required}>
      {(aria) => <input id={id} name={name} required={required} className={cn(controlClass, className)} {...aria} {...rest} />}
    </FieldShell>
  )
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  options: { value: string; label: string }[]
  placeholder?: string
  hint?: string
}

export function SelectField({ label, name, options, placeholder, hint, className, required, ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} name={name} hint={hint} isRequired={required}>
      {(aria) => (
        <select id={id} name={name} required={required} className={cn(controlClass, className)} {...aria} {...rest}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  hint?: string
}

export function TextAreaField({ label, name, hint, className, required, ...rest }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} name={name} hint={hint} isRequired={required}>
      {(aria) => (
        <textarea id={id} name={name} required={required} rows={3} className={cn(controlClass, 'py-2', className)} {...aria} {...rest} />
      )}
    </FieldShell>
  )
}
