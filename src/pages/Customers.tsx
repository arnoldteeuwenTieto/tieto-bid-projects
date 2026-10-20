import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Building2, Check, ChevronLeft, ChevronRight, Globe2, Plus, Search, Users, X } from 'lucide-react'
import { customerService } from '../services/customers'
import type { CustomerService } from '../services/CustomerService'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerDetails } from '../components/CustomerDetails'
import type { Customer } from '../models/Customer'
import { StatusBadge } from '../components/StatusBadge'

const columns: { key: 'customerName' | 'organizationNumber' | 'country' | 'contactPerson' | 'status'; label: string }[] = [
  { key: 'customerName', label: 'Customer name' }, { key: 'organizationNumber', label: 'Organization number' },
  { key: 'country', label: 'Country' }, { key: 'contactPerson', label: 'Contact person' }, { key: 'status', label: 'Status' },
]
const initials = (name: string) => name.split(' ').slice(0, 2).map(part => part[0]).join('')
export function Customers({ service = customerService }: { service?: CustomerService }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All customers')
  const [sort, setSort] = useState<{ key: keyof Customer; ascending: boolean }>({ key: 'customerName', ascending: true })
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [params, setParams] = useSearchParams()
  const selected = params.get('customerId')
  function setSelected(id: string | null) {
    const next = new URLSearchParams(params)
    if (id) next.set('customerId', id)
    else next.delete('customerId')
    setParams(next)
  }
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    service.list().then(records => { if (active) setCustomers(records) }).catch(() => { if (active) setLoadError('Unable to load customers. Please try again.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [service, attempt])
  const filtered = useMemo(() => customers.filter(customer =>
    (filter === 'All customers' || customer.status === filter) &&
    columns.some(({key}) => (customer[key] ?? '').toLowerCase().includes(search.trim().toLowerCase()))
  ).sort((a, b) => (a[sort.key] ?? '').localeCompare(b[sort.key] ?? '') * (sort.ascending ? 1 : -1)), [customers, search, filter, sort])
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  return <>
    <div className="page-heading"><div><div className="eyebrow">RELATIONSHIPS THAT MOVE US FORWARD</div><h1>Customers<span className="heading-dot">.</span></h1><p>Manage your customer relationships, all in one place.</p></div><button className="primary-button" disabled={loading || !!loadError} onClick={() => setCreating(true)}><Plus />New customer</button></div>
    <div className="stats-grid">
      <div className="stat-card"><div><span>Total customers</span><strong>{loading || loadError ? '—' : customers.length}<small>Your customer network</small></strong></div><span className="stat-icon"><Users /></span></div>
      <div className="stat-card"><div><span>Active customers</span><strong>{loading || loadError ? '—' : customers.filter(c => c.status === 'Active').length}<small><span className="tiny-dot" />Building lasting partnerships</small></strong></div><span className="stat-icon green"><Building2 /></span></div>
      <div className="stat-card"><div><span>Countries represented</span><strong>{loading || loadError ? '—' : new Set(customers.map(c => c.country)).size}<small>Connections across borders</small></strong></div><span className="stat-icon purple"><Globe2 /></span></div>
    </div>
    {notice && <div className="notice" role="status"><Check />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X /></button></div>}
    <section className="card directory" aria-label="Customer directory">
      <div className="directory-title"><h2>Customer directory <span>{customers.length}</span></h2><span className="subtle">A shared view of every relationship</span></div>
      <div className="directory-tools"><div className="tabs" aria-label="Filter by status">{['All customers', 'Active', 'Prospect', 'Inactive'].map(tab => <button key={tab} className={filter === tab ? 'selected' : ''} aria-pressed={filter === tab} onClick={() => { setFilter(tab); setPage(1) }}>{tab}</button>)}</div><div className="search-field"><Search /><input aria-label="Search customers" placeholder="Search customers…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} />{search && <button className="icon-button" aria-label="Clear search" onClick={() => setSearch('')}><X /></button>}</div></div>
      {!loading && !loadError && <><div className="table-scroll"><table><thead><tr>{columns.map(({key, label}) => <th key={key} aria-sort={sort.key === key ? sort.ascending ? 'ascending' : 'descending' : 'none'}><button onClick={() => { setSort({ key, ascending: sort.key === key ? !sort.ascending : true }); setPage(1) }}>{label}{sort.key === key ? sort.ascending ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown />}</button></th>)}<th><span className="sr-only">Details</span></th></tr></thead><tbody>{visible.map((customer, index) => <tr key={customer.id} onClick={event => { event.currentTarget.querySelector<HTMLButtonElement>("button")?.focus(); setSelected(customer.id) }}><td><button className="customer-link" onClick={event => { event.stopPropagation(); setSelected(customer.id) }}><span className={`company-avatar tone-${index % 4}`}>{initials(customer.customerName)}</span>{customer.customerName}</button></td><td className="org-number">{customer.organizationNumber}</td><td><span className="country-dot" />{customer.country}</td><td>{customer.contactPerson || '—'}</td><td><StatusBadge status={customer.status} /></td><td><ChevronRight className="row-arrow" /></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="empty-state"><Search /><h3>{customers.length ? 'No customers found' : 'No customers yet'}</h3><p>{customers.length ? 'Try another search or clear the filters.' : 'Add your first fictional customer using New customer.'}</p><button className="secondary-button" onClick={() => { setSearch(''); setFilter('All customers') }}>Clear filters</button></div>}
      <div className="table-footer"><span>Showing <strong>{filtered.length ? (currentPage - 1) * 10 + 1 : 0}–{Math.min(currentPage * 10, filtered.length)}</strong> of <strong>{filtered.length}</strong> customers</span><div className="pagination"><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></button>{Array.from({ length: pages }, (_, i) => <button key={i} className={currentPage === i + 1 ? 'current' : ''} aria-label={`Page ${i + 1}`} aria-current={currentPage === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button aria-label="Next page" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight /></button></div></div>
      </>}
      {loading && <div className="empty-state" role="status">Loading customers…</div>}
      {!loading && loadError && <div className="empty-state" role="alert"><h3>Customers unavailable</h3><p>{loadError}</p><button className="secondary-button" onClick={() => { setLoading(true); setLoadError(''); setAttempt(value => value + 1) }}>Try again</button></div>}
    </section>
    <div className="data-note"><span className="tiny-dot" />Demo workspace<span>All customer information is fictional. Changes last for this session.</span></div>
    {creating && <CustomerForm service={service} onClose={() => setCreating(false)} onSave={customer => { setCustomers(previous => [...previous, customer]); setCreating(false); setSearch(''); setFilter('All customers'); setSort({key: 'customerName', ascending: true}); setPage(1); setNotice(`${customer.customerName} was added to your customer directory.`) }} />}
    {selected && <CustomerDetails key={selected} customerId={selected} service={service} onClose={() => setSelected(null)} />}
  </>
}




