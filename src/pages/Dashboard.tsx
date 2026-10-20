import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, RefreshCw, X } from 'lucide-react'
import { dashboardService } from '../services/DashboardService'
import type { DashboardService } from '../services/DashboardService'
import { analyzeDashboard } from '../analytics/dashboard'
import { dashboardConfig, dashboardPeriods } from '../config/dashboard'
import { bidCategories, bidStages } from '../config/bidOptions'
import { useAsyncData } from '../hooks/useAsyncData'
import { DashboardCard, DashboardKpi, MoneyValues } from '../components/DashboardCards'
import { FinancialComparison } from '../components/FinancialComparison'
import { CustomerRanking } from '../components/CustomerRanking'
import '../styles/dashboard.css'

function osloToday() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) }

export function Dashboard({ service = dashboardService }: { service?: DashboardService }) {
  const load = useCallback(() => service.snapshot(), [service])
  const { data, loading, error, retry } = useAsyncData(load)
  const [params, setParams] = useSearchParams()
  const [currencyChoice, setCurrencyChoice] = useState('')
  const [fullRanking, setFullRanking] = useState(false)
  const period = dashboardPeriods.some(option => option.value === params.get('period')) ? params.get('period')! : 'all'
  const customerId = params.get('customerId') ?? ''
  const stage = params.get('stage') ?? ''
  const category = params.get('category') ?? ''
  const [today, setToday] = useState(osloToday)
  const result = useMemo(() => analyzeDashboard(data?.customers ?? [], data?.bids ?? [], { period, customerId, stage, category }, today), [data, period, customerId, stage, category, today])
  function changeFilter(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next) }
  function bidsLink(overrides: Record<string, string> = {}, closed = false, id?: string) {
    const next = new URLSearchParams()
    if (customerId) next.set('customerId', customerId)
    if (stage) next.set('stage', stage)
    if (category) next.set('category', category)
    if (result.from) { next.set(closed ? 'closedFrom' : 'createdFrom', result.from); next.set(closed ? 'closedTo' : 'createdTo', today) }
    for (const [key, value] of Object.entries(overrides)) next.set(key, value)
    return `/bids${id ? `/${encodeURIComponent(id)}` : ''}?${next}`
  }
  const customerScope = customerId ? `&scopeCustomerId=${encodeURIComponent(customerId)}` : ''
  const ranking = result.rankings.find(item => item.currency === currencyChoice) ?? result.rankings[0]
  const pipelineCurrencies = Object.keys(result.pipeline.totals)
  const activeFilters = [
    ...(period !== 'all' ? [{ key: 'period', label: 'Period', value: dashboardPeriods.find(option => option.value === period)!.label }] : []),
    ...(customerId ? [{ key: 'customerId', label: 'Customer', value: data?.customers.find(customer => customer.id === customerId)?.customerName ?? customerId }] : []),
    ...(stage ? [{ key: 'stage', label: 'Stage', value: stage }] : []),
    ...(category ? [{ key: 'category', label: 'Category', value: category }] : []),
  ]
  const largestStage = Math.max(1, ...result.stages.map(item => item.count))
  const closedTotal = result.won + result.lost
  const customerLink = (id: string) => `/customers?customerId=${encodeURIComponent(id)}`
  return <>
    <div className="page-heading"><div><div className="eyebrow">A CLEARER VIEW OF WHAT’S NEXT</div><h1>Dashboard<span className="heading-dot">.</span></h1><p>Your customer relationships and commercial opportunities, in focus.</p></div><button className="secondary-button" disabled={loading} onClick={() => { setToday(osloToday()); retry() }}><RefreshCw />Refresh snapshot</button></div>
    <section className="card dashboard-filters" aria-label="Dashboard filters">
      <label className={period !== 'all' ? 'filter-is-active' : ''}>Time period<select value={period} onChange={event => changeFilter('period', event.target.value)}>{dashboardPeriods.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label className={customerId ? 'filter-is-active' : ''}>Customer<select value={customerId} onChange={event => changeFilter('customerId', event.target.value)}><option value="">All customers</option>{customerId && !data?.customers.some(customer => customer.id === customerId) && <option value={customerId}>Unavailable customer ({customerId})</option>}{data?.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.customerName}</option>)}</select></label>
      <label className={stage ? 'filter-is-active' : ''}>Bid stage<select value={stage} onChange={event => changeFilter('stage', event.target.value)}><option value="">All stages</option>{Array.from(new Set([...bidStages, ...(data?.bids.map(bid => bid.stage) ?? []), ...(stage ? [stage] : [])])).map(value => <option key={value}>{value}</option>)}</select></label>
      <label className={category ? 'filter-is-active' : ''}>Bid category<select value={category} onChange={event => changeFilter('category', event.target.value)}><option value="">All categories</option>{Array.from(new Set([...bidCategories, ...(data?.bids.map(bid => bid.category) ?? []), ...(category ? [category] : [])])).map(value => <option key={value}>{value}</option>)}</select></label>
      <button className="secondary-button" onClick={() => setParams({})}>Reset</button>
      <div className="active-filter-summary"><strong>{activeFilters.length ? `${activeFilters.length} active ${activeFilters.length === 1 ? 'filter' : 'filters'}` : 'All records · no filters applied'}</strong>{activeFilters.map(filter => <button className="filter-chip" key={filter.key} aria-label={`Remove ${filter.label.toLowerCase()} filter: ${filter.value}`} onClick={() => changeFilter(filter.key, '')}><span>{filter.label}: {filter.value}</span><X aria-hidden="true" /></button>)}</div>
    </section>
    {loading ? <div className="card empty-state" role="status">Loading your dashboard…</div> : error ? <div className="card empty-state" role="alert"><h2>Dashboard unavailable</h2><p>{error}</p><button className="primary-button" onClick={retry}>Try again</button></div> : <>
      <div className="dashboard-basis"><strong>Snapshot · {today}</strong><span>Open bid metrics: {result.from ? `bids created ${result.from}–${today}` : 'all creation dates'}. Win rate: {result.from ? 'closed during the selected period' : 'all won/lost outcomes'}. Customer status and contact: current snapshot, customer filter only.</span></div>
      {!data?.customers.length && !data?.bids.length && <div className="notice" role="status">No records yet. Create customers and bids to populate this dashboard.</div>}
      <div className="dashboard-kpis">
        <DashboardKpi title="Open pipeline value" caption={`${result.pipeline.included}/${result.open.length} open bids valued · currencies kept separate`} to={bidsLink({ scope: 'valued-open' })} accent action="View valued bids" detail={pipelineCurrencies.length > 1 ? <MoneyValues totals={result.pipeline.totals} /> : undefined}>{pipelineCurrencies.length > 1 ? <span className="multi-currency-value">Multiple currencies</span> : <MoneyValues totals={result.pipeline.totals} />}</DashboardKpi>
        <DashboardKpi title="Active bids" caption="Current open stage · selected creation period" to={bidsLink({ scope: 'open' })} action="View active bids">{result.open.length}</DashboardKpi>
        <DashboardKpi title="Bid win rate" caption={`${result.won} won / ${closedTotal} closed · open bids excluded`} to={bidsLink({ scope: 'closed' }, true)} action="View closed bids">{result.winRate === null ? 'N/A' : `${Math.round(result.winRate * 100)}%`}</DashboardKpi>
        <DashboardKpi title="Active customers" caption="Current status · customer filter only" to={`/customers?status=Active${customerScope}`} action="View active customers">{result.activeCustomers.length}</DashboardKpi>
      </div>
      <div className="dashboard-grid">
        <DashboardCard title="Open bid pipeline" caption="Current-stage distribution, not historical conversion. Select a stage to explore bids.">
          <div className="pipeline-chart" aria-label="Number of open bids by current stage">{result.stages.map((item, index) => <Link className="pipeline-row" key={item.stage} to={bidsLink({ stage: item.stage, scope: 'open' })} aria-label={`${item.stage}: ${item.count} open bids. View bids.`}><span>{item.stage}</span><span className="pipeline-track"><span className={`pipeline-bar bar-${index}`} style={{ width: `${item.count / largestStage * 100}%` }} /></span><strong>{item.count}</strong></Link>)}</div>
          <div className="outcomes-heading"><h3>Closed outcomes</h3><span>{result.from ? 'Actual close date in selected period' : 'All won/lost records'}</span></div>
          {closedTotal ? <><div className="outcome-chart" aria-label={`${result.won} won bids and ${result.lost} lost bids`}>{result.won > 0 && <Link className="outcome-won" style={{ flex: result.won }} to={bidsLink({ stage: 'Won', scope: 'closed' }, true)} aria-label={`${result.won} won bids`}>{result.won}</Link>}{result.lost > 0 && <Link className="outcome-lost" style={{ flex: result.lost }} to={bidsLink({ stage: 'Lost', scope: 'closed' }, true)} aria-label={`${result.lost} lost bids`}>{result.lost}</Link>}</div><div className="outcome-legend"><Link to={bidsLink({ stage: 'Won', scope: 'closed' }, true)}>Won · {result.won}</Link><Link to={bidsLink({ stage: 'Lost', scope: 'closed' }, true)}>Lost · {result.lost}</Link></div></> : <p className="dashboard-empty">No closed bids in this scope. Win rate is N/A.</p>}
        </DashboardCard>
        <DashboardCard title="Financial pipeline" caption="Open bids in the selected creation period. No currency conversion applied.">
          <FinancialComparison unweighted={result.pipeline.totals} weighted={result.weighted.totals} />
          <p className="dashboard-explanation">Weighted values use explicit fictional probability assumptions, not a revenue forecast. {result.weighted.included}/{result.open.length} bids qualify; {result.weighted.excluded} lack valid value, currency or probability data.</p>
          <p className="dashboard-explanation">Unweighted excludes {result.pipeline.excluded} bids with unavailable or invalid financial data. New bids have no financial assumptions by default.</p>
        </DashboardCard>
        <DashboardCard title="Customer portfolio" caption="Customer totals/status/contact use the customer filter only. Open bid counts use all selected bid filters.">
          <div className="portfolio-metrics">{[['Total customers', result.portfolio.length], ['With open bids in scope', result.withOpen.length], ['No open bids in scope', result.withoutOpen.length], ['Need contact', result.withoutContact.length]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
          <div className="portfolio-list-heading"><h3>Customer relationships</h3><span>{result.portfolio.length} customers in scope</span></div><div className="portfolio-list" role="region" aria-label="Customer relationships list" tabIndex={0}>{result.portfolio.length ? result.portfolio.map(customer => <Link key={customer.id} to={customerLink(customer.id)}><span><strong>{customer.customerName}</strong><small>Last contact: {customer.lastContactDate ?? 'Data not available'}</small></span><span className="portfolio-tag">{result.withOpen.some(item => item.id === customer.id) ? 'Open bids in scope' : 'No open bids in scope'}<ArrowRight /></span></Link>) : <p className="dashboard-empty">No customers in this scope.</p>}</div>
          <div className="dashboard-card-actions"><Link to={customerId ? `/customers?scopeCustomerId=${encodeURIComponent(customerId)}` : '/customers'}>View all customers<ArrowRight aria-hidden="true" /></Link></div>
          <p className="dashboard-explanation">No open bids indicates opportunity coverage in scope, not customer utilization. {result.unknownContact.length} customers have unavailable or invalid contact dates.</p>
        </DashboardCard>
        <DashboardCard title="Top customers by open value" caption="Estimated open bid value, grouped by currency. Select a customer to view details.">
          {ranking && ranking.customers.length > 0 ? <><label className="ranking-currency">Currency<select value={ranking.currency} onChange={event => setCurrencyChoice(event.target.value)}>{result.rankings.map(item => <option key={item.currency}>{item.currency}</option>)}</select></label><div className="ranking-chart">{ranking.customers.map((item, index) => <Link key={item.customer.id} to={customerLink(item.customer.id)}><span className="ranking-line"><span>{index + 1}. {item.customer.customerName}</span><strong><MoneyValues totals={{ [ranking.currency]: item.value }} /></strong></span><span className="ranking-track"><span style={{ width: `${item.value / ranking.customers[0].value * 100}%` }} /></span></Link>)}</div></> : <p className="dashboard-empty">{result.pipeline.included ? 'No positive estimated open value in this scope.' : 'Data not available. No valued open bids in this scope.'}</p>}
          <div className="dashboard-card-actions"><button onClick={() => setFullRanking(true)}>View full ranking<ArrowRight aria-hidden="true" /></button></div>
        </DashboardCard>
      </div>
      <DashboardCard title="Needs attention" caption={`Bid alerts use scoped open bids. Decisions: next ${dashboardConfig.upcomingDecisionDays} days; stalled: over ${dashboardConfig.stalledBidDays} days. Customer contact: over ${dashboardConfig.customerInactivityDays} days, customer filter only.`} className="attention-card">
        <div className="attention-grid"><div><h3>Opportunities · {result.bidAttention.length}</h3>{result.bidAttention.length ? <ul>{result.bidAttention.map(({ bid, reasons }) => <li key={bid.id}><Link to={bidsLink({}, false, bid.id)}><strong>{bid.bidTitle}</strong><small>{bid.id} · {reasons.join(' · ')}</small><ArrowRight /></Link></li>)}</ul> : <p className="dashboard-empty">No bid alerts based on available data.</p>}<p className="dashboard-explanation">{result.missingActivity} open bids have unavailable or invalid activity dates; activity is never inferred from modification timestamps.</p></div><div><h3>Customer contact · {result.withoutContact.length}</h3>{result.withoutContact.length ? <ul>{result.withoutContact.map(customer => <li key={customer.id}><Link to={customerLink(customer.id)}><strong>{customer.customerName}</strong><small>Last contact {customer.lastContactDate}</small><ArrowRight /></Link></li>)}</ul> : <p className="dashboard-empty">No contact alerts based on available data.</p>}</div></div>
      </DashboardCard>
      {fullRanking && <CustomerRanking customers={result.portfolio} bids={result.open} initialCurrency={ranking?.currency} onClose={() => setFullRanking(false)} />}
      <p className="dashboard-explanation dashboard-quality">Data coverage: {result.missingCreated} bids lack valid creation dates; {result.missingClosed} closed bids lack valid close dates. Missing dates are excluded from date-limited metrics. {result.unknownStages} bids have unclassified stages and are excluded from open/closed calculations.</p>
      <div className="data-note"><span className="tiny-dot" />Fictional demo snapshot<span>Shared service records · no exchange rates, production probabilities or utilization data.</span></div>
    </>}
  </>
}


