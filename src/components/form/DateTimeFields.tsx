import { TextField } from '@/components/form/Fields'

interface DateTimeFieldProps {
  label: string
  name: string
  defaultValue?: string
  min?: string
}

export function DatePicker({ label, name, defaultValue, min }: DateTimeFieldProps) {
  return <TextField label={label} name={name} type="date" defaultValue={defaultValue} min={min} required />
}

export function TimeField({ label, name, defaultValue }: DateTimeFieldProps) {
  return <TextField label={label} name={name} type="time" step={900} defaultValue={defaultValue} required />
}
