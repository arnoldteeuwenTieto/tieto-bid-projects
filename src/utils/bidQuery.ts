import { hasValidValue, inDateRange, isOpenBid } from '../analytics/dashboard'
import type { Bid } from '../models/Bid'
import type { Customer } from '../models/Customer'
export type BidSortKey = 'bidTitle' | 'customerName' | 'stage' | 'category' | 'coOwner'
export interface BidQuery { search: string; customerId: string | null; stage: string; category: string; sortKey: BidSortKey; ascending: boolean; scope?: string; createdFrom?: string; createdTo?: string; closedFrom?: string; closedTo?: string }
export function selectBids(bids: readonly Bid[], customers: readonly Customer[], query: BidQuery) {
  const names = new Map(customers.map(customer => [customer.id, customer.customerName]))
  const term = query.search.trim().toLowerCase()
  return bids.map(bid => ({ ...bid, customerName: names.get(bid.customerId) ?? `Unavailable customer (${bid.customerId})` }))
    .filter(bid => (!query.customerId || bid.customerId === query.customerId) && (!query.stage || bid.stage === query.stage) && (!query.category || bid.category === query.category) && (!term || bid.bidTitle.toLowerCase().includes(term) || bid.customerName.toLowerCase().includes(term)))
    .filter(bid => (!query.scope || (query.scope === 'open' ? isOpenBid(bid) : query.scope === 'valued-open' ? isOpenBid(bid) && hasValidValue(bid) : query.scope === 'closed' ? ['Won', 'Lost'].includes(bid.stage) : true)) && inDateRange(bid.createdDate, query.createdFrom, query.createdTo) && inDateRange(bid.actualCloseDate, query.closedFrom, query.closedTo))
    .sort((a, b) => ((a[query.sortKey] ?? '').localeCompare(b[query.sortKey] ?? '') || a.id.localeCompare(b.id)) * (query.ascending ? 1 : -1))
}

