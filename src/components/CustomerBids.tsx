import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { bidService } from '../services/bids'
import type { BidService } from '../services/BidService'
import { useAsyncData } from '../hooks/useAsyncData'
export function CustomerBids({ customerId, service = bidService }: { customerId: string; service?: BidService }) {
  const load = useCallback(() => service.list(), [service])
  const { data, loading, error, retry } = useAsyncData(load)
  const bids = (data ?? []).filter(bid => bid.customerId === customerId)
  return <section className="related-section" aria-label="Related bids"><h3>Bids{!loading && !error && <span>{bids.length}</span>}</h3>{loading ? <p role="status">Loading related bids…</p> : error ? <div className="related-error" role="alert"><p>Unable to load related bids.</p><button className="secondary-button" onClick={retry}>Try again</button></div> : bids.length ? <ul>{bids.map(bid => <li key={bid.id}><Link to={`/bids/${encodeURIComponent(bid.id)}?customerId=${encodeURIComponent(customerId)}`}><span><strong>{bid.bidTitle}</strong><small>{bid.id} · {bid.stage}</small></span><ArrowRight /></Link></li>)}</ul> : <p>No related bids in this demo.</p>}</section>
}
