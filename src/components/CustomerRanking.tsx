import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Customer } from '../models/Customer'
import type { Bid } from '../models/Bid'
import { groupMoney } from '../analytics/dashboard'
import { Modal } from './Modal'
import { MoneyValues } from './DashboardCards'
export function CustomerRanking({ customers, bids, initialCurrency, onClose }: { customers: readonly Customer[]; bids: readonly Bid[]; initialCurrency?: string; onClose: () => void }) {
  const currencies = Object.keys(groupMoney(bids).totals).sort()
  const [choice, setChoice] = useState(initialCurrency ?? '')
  const currency = currencies.includes(choice) ? choice : currencies[0]
  const rows = currency ? customers.map(customer => ({ customer, value: groupMoney(bids.filter(bid => bid.customerId === customer.id && bid.currency === currency)).totals[currency] ?? 0 })).filter(row => row.value > 0).sort((a, b) => b.value - a.value) : []
  return <Modal title="Full customer ranking" className="ranking-modal" onClose={onClose}><div className="ranking-modal-intro"><p>All customers with positive estimated open bid value in the current dashboard scope. Currencies are ranked separately.</p>{currencies.length > 0 && <label className="ranking-currency">Currency<select value={currency} onChange={event => setChoice(event.target.value)}>{currencies.map(value => <option key={value}>{value}</option>)}</select></label>}</div>{rows.length ? <div className="ranking-table-scroll" role="region" aria-label="Full customer ranking table" tabIndex={0}><table><caption className="sr-only">Full ranking by estimated open value in {currency}</caption><thead><tr><th scope="col">Rank</th><th scope="col">Customer</th><th scope="col">Open value</th></tr></thead><tbody>{rows.map(({ customer, value }, index) => <tr key={customer.id}><td>{index + 1}</td><td><Link to={`/customers?customerId=${encodeURIComponent(customer.id)}`}>{customer.customerName}</Link></td><td><MoneyValues totals={{ [currency]: value }} /></td></tr>)}</tbody></table></div> : <p className="dashboard-empty ranking-modal-intro">No positive estimated open value in this scope.</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose}>Done</button></div></Modal>
}
