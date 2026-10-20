import { activeBidStages } from '../config/bidOptions'
import { dashboardConfig } from '../config/dashboard'
import type { Bid } from '../models/Bid'
import type { Customer } from '../models/Customer'
export interface DashboardFilters { period: string; customerId: string; stage: string; category: string }
export function validDate(value?: string): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null
}
export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}
export function periodStart(period: string, today: string): string | undefined {
  return period === 'year' ? `${today.slice(0, 4)}-01-01` : period === '30' || period === '90' ? shiftDate(today, 1 - Number(period)) : undefined
}
export function inDateRange(value: string | undefined, from?: string, to?: string): boolean {
  if (!from && !to) return true
  const date = validDate(value)
  return !!date && (!from || date >= from) && (!to || date <= to)
}
export function isOpenBid(bid: Bid): boolean { return activeBidStages.includes(bid.stage) }
export function hasValidValue(bid: Bid): boolean {
  return typeof bid.estimatedValue === 'number' && Number.isFinite(bid.estimatedValue) && bid.estimatedValue >= 0 && !!bid.currency && /^[A-Z]{3}$/.test(bid.currency) && supportedCurrency(bid.currency)
}
function supportedCurrency(currency: string): boolean {
  return Intl.supportedValuesOf('currency').includes(currency)
}
export function groupMoney(bids: readonly Bid[], weighted = false) {
  const totals: Record<string, number> = {}
  let included = 0
  for (const bid of bids) {
    if (!hasValidValue(bid) || (weighted && (typeof bid.probability !== 'number' || !Number.isFinite(bid.probability) || bid.probability < 0 || bid.probability > 1))) continue
    const currency = bid.currency!
    totals[currency] = (totals[currency] ?? 0) + bid.estimatedValue! * (weighted ? bid.probability! : 1)
    included++
  }
  return { totals, included, excluded: bids.length - included }
}
export function analyzeDashboard(customers: readonly Customer[], bids: readonly Bid[], filters: DashboardFilters, today: string, config = dashboardConfig) {
  const from = periodStart(filters.period, today)
  const scoped = bids.filter(bid => (!filters.customerId || bid.customerId === filters.customerId) && (!filters.stage || bid.stage === filters.stage) && (!filters.category || bid.category === filters.category))
  const cohort = scoped.filter(bid => inDateRange(bid.createdDate, from, from ? today : undefined))
  const open = cohort.filter(isOpenBid)
  const closed = scoped.filter(bid => (bid.stage === 'Won' || bid.stage === 'Lost') && (from ? inDateRange(bid.actualCloseDate, from, today) : true))
  const won = closed.filter(bid => bid.stage === 'Won').length
  const lost = closed.filter(bid => bid.stage === 'Lost').length
  const portfolio = customers.filter(customer => !filters.customerId || customer.id === filters.customerId)
  const hasOpen = new Set(open.map(bid => bid.customerId))
  const withoutContact = portfolio.filter(customer => { const date = validDate(customer.lastContactDate); return !!date && date <= today && date < shiftDate(today, -config.customerInactivityDays) })
  const bidAttention = open.flatMap(bid => {
    const reasons: string[] = []
    const decision = validDate(bid.expectedDecisionDate)
    const next = validDate(bid.nextActionDate)
    const activity = validDate(bid.lastActivityDate)
    if (decision && decision >= today && decision <= shiftDate(today, config.upcomingDecisionDays)) reasons.push(`Decision due ${decision}`)
    if (next && next < today) reasons.push(`Next action overdue (${next})`)
    if (activity && activity <= today && activity < shiftDate(today, -config.stalledBidDays)) reasons.push(`No activity since ${activity}`)
    return reasons.length ? [{ bid, reasons }] : []
  })
  const currencies = Object.keys(groupMoney(open).totals).sort()
  const rankings = currencies.map(currency => ({ currency, customers: portfolio.map(customer => ({ customer, value: groupMoney(open.filter(bid => bid.customerId === customer.id && bid.currency === currency)).totals[currency] ?? 0 })).filter(item => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 5) }))
  return {
    from, cohort, open, closed, won, lost, winRate: closed.length ? won / closed.length : null,
    pipeline: groupMoney(open), weighted: groupMoney(open, true),
    stages: activeBidStages.map(stage => ({ stage, count: open.filter(bid => bid.stage === stage).length })),
    portfolio, activeCustomers: portfolio.filter(customer => customer.status === 'Active'),
    withOpen: portfolio.filter(customer => hasOpen.has(customer.id)), withoutOpen: portfolio.filter(customer => !hasOpen.has(customer.id)),
    withoutContact, unknownContact: portfolio.filter(customer => !validDate(customer.lastContactDate) || customer.lastContactDate! > today),
    bidAttention, rankings,
    missingCreated: scoped.filter(bid => !validDate(bid.createdDate)).length,
    missingClosed: scoped.filter(bid => ['Won', 'Lost'].includes(bid.stage) && !validDate(bid.actualCloseDate)).length,
    unknownStages: cohort.filter(bid => !isOpenBid(bid) && !['Won', 'Lost'].includes(bid.stage)).length,
    missingActivity: open.filter(bid => !validDate(bid.lastActivityDate) || bid.lastActivityDate! > today).length,
  }
}

