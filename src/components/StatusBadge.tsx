import type { CustomerStatus } from '../models/Customer'
export function StatusBadge({ status }: { status: CustomerStatus }) { return <span className={`status-badge ${status.toLowerCase()}`}><span />{status}</span> }

