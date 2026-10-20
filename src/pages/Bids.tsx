import { useCallback, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronRight, FileText, Plus, Search, Trophy, TrendingUp, X } from 'lucide-react'
import { bidService } from '../services/bids'
import { customerService } from '../services/customers'
import type { BidService } from '../services/BidService'
import type { CustomerService } from '../services/CustomerService'
import type { Bid } from '../models/Bid'
import { activeBidStages, bidCategories, bidStages } from '../config/bidOptions'
import { selectBids } from '../utils/bidQuery'
import type { BidSortKey } from '../utils/bidQuery'
import { useAsyncData } from '../hooks/useAsyncData'
import { BidDetails } from '../components/BidDetails'
import { BidForm } from '../components/BidForm'
import { Pagination } from '../components/Pagination'
const columns: { key: BidSortKey; label: string }[] = [
  { key: 'bidTitle', label: 'Bid title' }, { key: 'customerName', label: 'Customer' }, { key: 'stage', label: 'Stage' }, { key: 'category', label: 'Category' }, { key: 'coOwner', label: 'Co-owner' },
]
export function Bids({ service = bidService, customers = customerService }: { service?: BidService; customers?: CustomerService }) {
  const load = useCallback(async () => {
    const [bids, customerRecords] = await Promise.all([service.list(), customers.list()])
    return { bids, customers: customerRecords }
  }, [service, customers])
  const { data, setData, loading, error, retry } = useAsyncData(load)
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: BidSortKey; ascending: boolean }>({ key: 'bidTitle', ascending: true })
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)
  const [params, setParams] = useSearchParams()
  const customerId = params.get('customerId')
  const { recordId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const creating = location.pathname === '/bids/new'
  const query = params.toString() ? `?${params}` : ''
  const customer = data?.customers.find(customer => customer.id === customerId)
  const filtered = useMemo(() => selectBids(data?.bids ?? [], data?.customers ?? [], { search, stage, category, customerId, sortKey: sort.key, ascending: sort.ascending }), [data, search, stage, category, customerId, sort])
  const scopedBids = (data?.bids ?? []).filter(bid => !customerId || bid.customerId === customerId)
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10)
  function saved(bid: Bid) {
    setData(previous => previous ? { ...previous, bids: [...previous.bids.filter(record => record.id !== bid.id), bid] } : previous)
    setRevision(value => value + 1)
    setNotice(`${bid.bidTitle} was saved in this demo session.`)
    // A reassigned bid should remain visible when editing from a customer-filtered route.
    const nextParams = new URLSearchParams(params)
    if (customerId) nextParams.set('customerId', bid.customerId)
    navigate(`/bids/${encodeURIComponent(bid.id)}${nextParams.size ? `?${nextParams}` : ''}`)
  }
  function clearFilters() { setSearch(''); setStage(''); setCategory(''); setPage(1); const next = new URLSearchParams(params); next.delete('customerId'); setParams(next) }
  return <>
    <div className="page-heading"><div><div className="eyebrow">FROM OPPORTUNITY TO PARTNERSHIP</div><h1>Bids<span className="heading-dot">.</span></h1><p>A shared view of your opportunities, from first idea to a winning bid.</p></div><Link className="primary-button" to={`/bids/new${query}`}><Plus />New Bid</Link></div>
    <div className="stats-grid">{[
      { label: 'Total bids', value: scopedBids.length, caption: customerId ? 'For the selected customer' : 'Your opportunity pipeline', icon: FileText, tone: '' },
      { label: 'Active bids', value: scopedBids.filter(bid => activeBidStages.includes(bid.stage)).length, caption: 'Draft, in progress or submitted', icon: TrendingUp, tone: 'purple' },
      { label: 'Won bids', value: scopedBids.filter(bid => bid.stage === 'Won').length, caption: 'Opportunities turned into partnerships', icon: Trophy, tone: 'green' },
    ].map(({ label, value, caption, icon: Icon, tone }) => <div className="stat-card" key={label}><div><span>{label}</span><strong>{loading || error ? '—' : value}<small>{caption}</small></strong></div><span className={`stat-icon ${tone}`}><Icon /></span></div>)}</div>
    {notice && <div className="notice" role="status"><Check />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X /></button></div>}
    <section className="card directory" aria-label="Bid directory">
      <div className="directory-title"><h2>Bid directory <span>{scopedBids.length}</span></h2><span className="subtle">Bring every opportunity into focus</span></div>
      {customerId && <div className="customer-filter"><span>Customer: <strong>{customer?.customerName ?? customerId}</strong></span><button className="icon-button" aria-label="Remove customer filter" onClick={() => { const next = new URLSearchParams(params); next.delete('customerId'); setParams(next); setPage(1) }}><X /></button></div>}
      <div className="directory-tools bid-tools"><div className="bid-filters"><label htmlFor="stage-filter">Stage<select id="stage-filter" value={stage} onChange={event => { setStage(event.target.value); setPage(1) }}><option value="">All stages</option>{Array.from(new Set([...bidStages, ...(data?.bids.map(bid => bid.stage) ?? [])])).map(value => <option key={value}>{value}</option>)}</select></label><label htmlFor="category-filter">Category<select id="category-filter" value={category} onChange={event => { setCategory(event.target.value); setPage(1) }}><option value="">All categories</option>{Array.from(new Set([...bidCategories, ...(data?.bids.map(bid => bid.category) ?? [])])).map(value => <option key={value}>{value}</option>)}</select></label></div><div className="search-field"><Search /><input aria-label="Search bids by title or customer" placeholder="Search bids or customers…" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} />{search && <button className="icon-button" aria-label="Clear search" onClick={() => { setSearch(''); setPage(1) }}><X /></button>}</div></div>
      {loading ? <div className="empty-state" role="status">Loading bids…</div> : error ? <div className="empty-state" role="alert"><h3>Bids unavailable</h3><p>{error}</p><button className="secondary-button" onClick={retry}>Try again</button></div> : <>
        <div className="table-scroll"><table><thead><tr>{columns.map(({ key, label }) => <th key={key} aria-sort={sort.key === key ? sort.ascending ? 'ascending' : 'descending' : 'none'}><button onClick={() => { setSort({ key, ascending: sort.key === key ? !sort.ascending : true }); setPage(1) }}>{label}{sort.key === key ? sort.ascending ? <ArrowUp /> : <ArrowDown /> : <ArrowUpDown />}</button></th>)}<th>Actions</th></tr></thead><tbody>{visible.map(bid => <tr key={bid.id} onClick={event => { event.currentTarget.querySelector<HTMLAnchorElement>('a')?.focus(); navigate(`/bids/${encodeURIComponent(bid.id)}${query}`) }}><td><Link className="customer-link bid-title-link" onClick={event => event.stopPropagation()} to={`/bids/${encodeURIComponent(bid.id)}${query}`}><span className="company-avatar"><FileText /></span><span>{bid.bidTitle}<small>{bid.id}</small></span></Link></td><td>{bid.customerName}</td><td><span className="bid-stage">{bid.stage}</span></td><td>{bid.category}</td><td>{bid.coOwner || '—'}</td><td><Link className="icon-button" aria-label={`View ${bid.bidTitle}`} to={`/bids/${encodeURIComponent(bid.id)}${query}`} onClick={event => event.stopPropagation()}><ChevronRight /></Link></td></tr>)}</tbody></table></div>
        {!filtered.length && <div className="empty-state"><Search /><h3>{data?.bids.length ? 'No bids found' : 'No bids yet'}</h3><p>{data?.bids.length ? 'Try another search or clear the filters.' : 'Create your first fictional opportunity using New Bid.'}</p><button className="secondary-button" onClick={clearFilters}>Clear filters</button></div>}
        <Pagination page={currentPage} total={filtered.length} pageSize={10} noun="bids" onChange={setPage} />
      </>}
    </section>
    <div className="data-note"><span className="tiny-dot" />Demo workspace<span>All bids and choices are fictional. Changes last for this session.</span></div>
    {creating && <BidForm key={`new-${customerId}`} service={service} customers={customers} customerId={customerId} onClose={() => navigate(`/bids${query}`)} onSave={saved} />}
    {recordId && <BidDetails key={`${recordId}-${revision}`} bidId={recordId} service={service} customers={customers} onClose={() => navigate(`/bids${query}`)} onSave={saved} />}
  </>
}
