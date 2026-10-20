import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import type { Customer, CreateCustomerInput, CustomerStatus } from '../models/Customer'
import type { CustomerService } from '../services/CustomerService'
import { Modal } from './Modal'
const fields = [
  { key: 'customerName', label: 'Customer name', required: true },
  { key: 'organizationNumber', label: 'Organization number', required: true },
  { key: 'city', label: 'City', required: true },
  { key: 'country', label: 'Country', required: true },
  { key: 'contactPerson', label: 'Contact person', required: false },
]
export function CustomerForm({ service, onClose, onSave }: { service: CustomerService; onClose: () => void; onSave: (customer: Customer) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = event.currentTarget
    const data = new FormData(form)
    const values: CreateCustomerInput = { customerName: String(data.get('customerName') ?? '').trim(), organizationNumber: String(data.get('organizationNumber') ?? '').trim(), city: String(data.get('city') ?? '').trim(), country: String(data.get('country') ?? '').trim(), contactPerson: String(data.get('contactPerson') ?? '').trim() || undefined, status: String(data.get('status')) as CustomerStatus }
    const nextErrors: Record<string, string> = {}
    for (const field of fields) if (field.required && !values[field.key as keyof CreateCustomerInput]) nextErrors[field.key] = 'This field is required.'
    setErrors(nextErrors)
    setSaveError('')
    if (Object.keys(nextErrors).length) {
      (form.elements.namedItem(Object.keys(nextErrors)[0]) as HTMLInputElement)?.focus()
      return
    }
    setSaving(true)
    try { onSave(await service.create(values)) }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Unable to create customer. Please try again.') }
    finally { setSaving(false) }
  }
  return <Modal title="New customer" onClose={() => { if (!saving) onClose() }}><p className="form-intro">Start a new relationship. Add your customer’s details below.</p><form noValidate onSubmit={submit} aria-busy={saving}><fieldset className="form-fields" disabled={saving}>{fields.map(({ key, label, required }) => <label key={key} htmlFor={key}>{label} {required && <span className="required">*</span>}<input id={key} name={key} required={required} maxLength={120} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} placeholder={key === 'organizationNumber' ? 'e.g. FIC-NO-1016' : `Enter ${label.toLowerCase()}`} />{errors[key] && <span id={`${key}-error`} className="field-error">{errors[key]}</span>}</label>)}<label htmlFor="status">Status<select id="status" name="status" defaultValue="Prospect"><option>Prospect</option><option>Active</option><option>Inactive</option></select></label><p className="form-note">Use fictional information only in this demo workspace.</p>{saveError && <p className="field-error" role="alert">{saveError}</p>}</fieldset><div className="modal-actions"><button type="button" disabled={saving} className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" disabled={saving} className="primary-button"><Plus />{saving ? 'Creating…' : 'Create customer'}</button></div></form></Modal>
}
