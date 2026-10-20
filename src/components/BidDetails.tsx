import { hasValidValue } from '../analytics/dashboard'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Users } from 'lucide-react'
import type { Bid } from '../models/Bid'
import type { BidService } from '../services/BidService'
import type { CustomerService } from '../services/CustomerService'
import { useAsyncData } from '../hooks/useAsyncData'
import { Modal } from './Modal'
import { BidForm } from './BidForm'
import { TrustedBidLink } from './TrustedBidLink'

export function BidDetails({ bidId, service, customers, onClose, onSave }: { bidId: string; service: BidService; customers: CustomerService; onClose: () => void; onSave: (bid: Bid) => void }) {
  const load = useCallback(async () => {
    const bid = await service.get(bidId)
    return { bid, customer: bid ? await customers.get(bid.customerId) : null }
  }, [service, customers, bidId])
  const { data, loading, error, retry } = useAsyncData(load)
  const [editing, setEditing] = useState(false)
  if (editing && data?.bid) return <BidForm service={service} customers={customers} bid={data.bid} onClose={() => setEditing(false)} onSave={onSave} />
  const bid = data?.bid
  return <Modal title="Bid details" className="details-panel" onClose={onClose}>
    {loading ? <div className="empty-state" role="status">Loading bid details…</div> : error ? <div className="empty-state" role="alert"><p>{error}</p><button className="secondary-button" onClick={retry}>Try again</button></div> : !bid ? <div className="empty-state"><h3>Bid not found</h3><p>This bid is no longer available in the demo session.</p></div> : <>
      <div className="detail-identity"><h3>{bid.bidTitle}</h3><span className="bid-stage">{bid.stage}</span></div>
      <div className="detail-buttons"><TrustedBidLink kind="teams" url={bid.teamsUrl} /><TrustedBidLink kind="library" url={bid.documentLibraryUrl} /><Link className="secondary-button" to={`/customers?customerId=${encodeURIComponent(bid.customerId)}`}><Users />View customer</Link><button className="primary-button" onClick={() => setEditing(true)}><Pencil />Edit bid</button></div>
      <p className="library-note">External actions are disabled unless a trusted URL is configured.</p>
      <dl className="detail-list">{[
                ['Estimated value', hasValidValue(bid) ? `${bid.currency} ${bid.estimatedValue!.toLocaleString('en-GB')}` : 'Data not available'],
        ['Probability assumption', typeof bid.probability === 'number' && Number.isFinite(bid.probability) && bid.probability >= 0 && bid.probability <= 1 ? `${Math.round(bid.probability * 100)}% (demo)` : 'Data not available'],
        ['Created date', bid.createdDate ?? 'Data not available'], ['Expected decision', bid.expectedDecisionDate ?? 'Data not available'], ['Actual close', bid.actualCloseDate ?? 'Data not available'], ['Last activity', bid.lastActivityDate ?? 'Data not available'], ['Next action', bid.nextActionDate ?? 'Data not available'], ['Bid owner ID', bid.bidOwnerId ?? 'Not assigned'],
        ['Bid title', bid.bidTitle], ['Customer', data?.customer?.customerName ?? 'Customer unavailable'], ['Customer ID', bid.customerId], ['Stage', bid.stage], ['Category', bid.category], ['Co-owner', bid.coOwner ?? 'Not assigned'], ['Application ID', bid.id], ['Source system', bid.sourceSystem], ['External ID', bid.externalId ?? 'Not provided'], ['Document library URL', bid.documentLibraryUrl ?? 'Not configured'], ['Teams URL', bid.teamsUrl ?? 'Not configured'],
      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </>}
  </Modal>
}

