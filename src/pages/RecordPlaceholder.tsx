import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'
export function RecordPlaceholder() {
  const { pathname } = useLocation()
  const { recordId } = useParams()
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get('customerId')
  const kind = pathname.startsWith('/projects') ? 'Project' : 'Bid'
  const title = pathname === '/bids/new' ? 'Create New Bid' : recordId ? `${kind} details` : `${kind}s`
  return <><div className="page-heading"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>{title}</h1><p>{customerId ? `Selected customer application ID: ${customerId}` : 'Your workspace for related records.'}</p></div></div><section className="placeholder card"><span className="placeholder-icon"><Construction /></span><h2>{title}</h2>{recordId && <p>Record identifier: {recordId}</p>}<p>This is a navigation placeholder. {pathname === '/bids/new' ? 'Bid creation will be available in a future version. No bid has been saved.' : 'Record management will be available in a future version.'}</p><Link to="/customers" className="primary-button"><ArrowLeft />Back to customers</Link></section></>
}
