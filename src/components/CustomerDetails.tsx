import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FilePlus2, ArrowRight } from 'lucide-react'
import type { Customer } from '../models/Customer'
import type { CustomerService } from '../services/CustomerService'
import { mockProjects } from '../data/relationships'
import { validateLibraryUrl } from '../utils/libraryUrl'
import { Modal } from './Modal'
import { CustomerBids } from './CustomerBids'
import { StatusBadge } from './StatusBadge'

export function CustomerDetails({ customerId, service, onClose }: { customerId: string; service: CustomerService; onClose: () => void }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    service.get(customerId).then(value => { if (active) setCustomer(value) }).catch(() => { if (active) setError('Unable to load customer details. Please try again.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [customerId, service, attempt])
  const libraryUrl = validateLibraryUrl(customer?.documentLibraryUrl)
  const query = `?customerId=${encodeURIComponent(customerId)}`
  return <Modal title="Customer details" className="details-panel" onClose={onClose}>
    {loading ? <div className="empty-state" role="status">Loading customer details…</div> : error ? <div className="empty-state" role="alert"><p>{error}</p><button className="secondary-button" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1) }}>Try again</button></div> : !customer ? <div className="empty-state"><h3>Customer not found</h3><p>This customer is no longer available.</p></div> : <>
      <div className="detail-identity"><span className="company-avatar">{customer.customerName.split(' ').slice(0, 2).map(part => part[0]).join('')}</span><h3>{customer.customerName}</h3><StatusBadge status={customer.status} /></div>
      <div className="detail-buttons">{libraryUrl ? <a href={libraryUrl} className="secondary-button" target="_blank" rel="noopener noreferrer">Customer library<ExternalLink /></a> : <button className="secondary-button" disabled aria-describedby="library-unavailable">Customer library<ExternalLink /></button>}<Link className="secondary-button" to={`/bids${query}`}>Go to Bids<ArrowRight /></Link><Link className="primary-button" to={`/bids/new${query}`}><FilePlus2 />Create New Bid</Link></div>
      {!libraryUrl && <p id="library-unavailable" className="library-note">No trusted customer library is configured.</p>}
      <dl className="detail-list">{[
        ['Customer name', customer.customerName], ['Organization number', customer.organizationNumber], ['City', customer.city], ['Country', customer.country], ['Contact person', customer.contactPerson || 'Not provided'], ['Status', customer.status], ['Last contact', customer.lastContactDate ?? 'Data not available'], ['Normalized name', customer.normalizedName], ['Application ID', customer.id],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl>
      <div className="related-sections"><CustomerBids customerId={customer.id} /><RelatedSection title="Projects" records={mockProjects.filter(record => record.customerId === customer.id)} basePath="projects" query={query} /><p className="form-note">Related records are fictional demo data.</p></div>
    </>}
  </Modal>
}
function RelatedSection({ title, records, basePath, query }: { title: string; records: readonly { id: string; name: string; status: string }[]; basePath: string; query: string }) {
  return <section className="related-section" aria-label={`Related ${title.toLowerCase()}`}><h3>{title}<span>{records.length}</span></h3>{records.length ? <ul>{records.map(record => <li key={record.id}><Link to={`/${basePath}/${encodeURIComponent(record.id)}${query}`}><span><strong>{record.name}</strong><small>{record.id} · {record.status}</small></span><ArrowRight /></Link></li>)}</ul> : <p>No related {title.toLowerCase()} in this demo.</p>}</section>
}



