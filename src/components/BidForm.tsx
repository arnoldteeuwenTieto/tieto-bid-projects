import { useCallback, useState } from 'react'
import type { FormEvent } from 'react'
import type { Bid, CreateBidInput } from '../models/Bid'
import type { BidService } from '../services/BidService'
import type { CustomerService } from '../services/CustomerService'
import { bidCategories, bidCoOwners, bidStages } from '../config/bidOptions'
import { useAsyncData } from '../hooks/useAsyncData'
import { Modal } from './Modal'

export function BidForm({ service, customers, bid, customerId, onClose, onSave }: {
  service: BidService; customers: CustomerService; bid?: Bid; customerId?: string | null;
  onClose: () => void; onSave: (bid: Bid) => void;
}) {
  const loadCustomers = useCallback(() => customers.list(), [customers])
  const { data: records, loading, error, retry } = useAsyncData(loadCustomers)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const initialCustomerId = bid?.customerId ?? customerId ?? ''
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = event.currentTarget
    const data = new FormData(form)
    const values: CreateBidInput = { customerId: String(data.get('customerId') ?? ''), bidTitle: String(data.get('bidTitle') ?? '').trim(), stage: String(data.get('stage') ?? ''), category: String(data.get('category') ?? ''), coOwner: String(data.get('coOwner') ?? '') || undefined }
    const nextErrors: Record<string, string> = {}
    for (const key of ['customerId', 'bidTitle', 'stage', 'category'] as const) if (!values[key]) nextErrors[key] = 'This field is required.'
    if (values.customerId && !records?.some(customer => customer.id === values.customerId)) nextErrors.customerId = 'Select an available customer.'
    if (values.bidTitle.length > 160) nextErrors.bidTitle = 'Use at most 160 characters.'
    setErrors(nextErrors)
    setSaveError('')
    if (Object.keys(nextErrors).length) { (form.elements.namedItem(Object.keys(nextErrors)[0]) as HTMLElement)?.focus(); return }
    setSaving(true)
    try { onSave(bid ? await service.update(bid.id, values) : await service.create(values)) }
    catch (error) { setSaveError(error instanceof Error ? error.message : 'Unable to save bid. Please try again.') }
    finally { setSaving(false) }
  }
  const fieldError = (key: string) => errors[key] ? <span id={`${key}-error`} className="field-error">{errors[key]}</span> : null
  return <Modal title={bid ? 'Edit bid' : 'New Bid'} onClose={() => { if (!saving) onClose() }}>
    {loading ? <div className="empty-state" role="status">Loading customers…</div> : error ? <div className="empty-state" role="alert"><p>{error}</p><button className="secondary-button" onClick={retry}>Try again</button></div> : !records?.length ? <div className="empty-state"><h3>No customers available</h3><p>Create a fictional customer before adding a bid.</p><button className="secondary-button" onClick={onClose}>Close</button></div> : <>
      <p className="form-intro">{bid ? 'Update this demo bid.' : 'Connect a new opportunity to a customer.'}</p>
      <form noValidate onSubmit={submit} aria-busy={saving}><fieldset className="form-fields" disabled={saving}>
        <label htmlFor="customerId">Customer <span className="required">*</span><select id="customerId" name="customerId" defaultValue={records.some(customer => customer.id === initialCustomerId) ? initialCustomerId : ''} required aria-invalid={!!errors.customerId} aria-describedby={errors.customerId ? 'customerId-error' : undefined}><option value="">Select a customer</option>{records.map(customer => <option key={customer.id} value={customer.id}>{customer.customerName}</option>)}</select>{fieldError('customerId')}</label>
        {initialCustomerId && !records.some(customer => customer.id === initialCustomerId) && <p className="field-error">The linked customer is unavailable. Select another customer.</p>}
        <label htmlFor="bidTitle">Bid title <span className="required">*</span><input id="bidTitle" name="bidTitle" placeholder="Enter a bid title" defaultValue={bid?.bidTitle ?? ''} required maxLength={160} aria-invalid={!!errors.bidTitle} aria-describedby={errors.bidTitle ? 'bidTitle-error' : undefined} />{fieldError('bidTitle')}</label>
        <label htmlFor="stage">Stage <span className="required">*</span><select id="stage" name="stage" defaultValue={bid?.stage ?? ''} required aria-invalid={!!errors.stage} aria-describedby={errors.stage ? 'stage-error' : undefined}><option value="">Select a demo stage</option>{bidStages.map(stage => <option key={stage}>{stage}</option>)}</select>{fieldError('stage')}</label>
        <label htmlFor="category">Category <span className="required">*</span><select id="category" name="category" defaultValue={bid?.category ?? ''} required aria-invalid={!!errors.category} aria-describedby={errors.category ? 'category-error' : undefined}><option value="">Select a demo category</option>{bidCategories.map(category => <option key={category}>{category}</option>)}</select>{fieldError('category')}</label>
        <label htmlFor="coOwner">Co-owner <span className="subtle">(optional)</span><select id="coOwner" name="coOwner" defaultValue={bid?.coOwner ?? ''}><option value="">No co-owner</option>{bidCoOwners.map(owner => <option key={owner}>{owner}</option>)}</select></label>
        <p className="form-note">Fictional demo data. Stage, category and co-owner choices are provisional.</p>{saveError && <p className="field-error" role="alert">{saveError}</p>}
      </fieldset><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : bid ? 'Save changes' : 'Create bid'}</button></div></form>
    </>}
  </Modal>
}
