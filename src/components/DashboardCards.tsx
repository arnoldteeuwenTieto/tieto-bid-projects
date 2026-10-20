import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
export function DashboardCard({ title, caption, children, className = '' }: { title: string; caption?: string; children: ReactNode; className?: string }) {
  return <section className={`card dashboard-card ${className}`}><div className="dashboard-card-heading"><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{children}</section>
}
export function DashboardKpi({ title, children, caption, to, accent = false, detail, action = 'Explore records' }: { title: string; children: ReactNode; caption: string; to: string; accent?: boolean; detail?: ReactNode; action?: string }) {
  return <Link to={to} className={`card dashboard-kpi ${accent ? 'accent-kpi' : ''}`}><span className="kpi-label">{title}</span><strong className="kpi-value">{children}</strong>{detail && <div className="kpi-detail">{detail}</div>}<small className="kpi-caption">{caption}</small><span className="kpi-action">{action}<ArrowUpRight aria-hidden="true" /></span></Link>
}
export function MoneyValues({ totals }: { totals: Record<string, number> }) {
  const values = Object.entries(totals).sort(([a], [b]) => a.localeCompare(b))
  return values.length ? <>{values.map(([currency, value]) => <span className="money-value" key={currency}>{new Intl.NumberFormat('en-GB', { style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: 0, maximumFractionDigits: 20 }).format(value)}</span>)}</> : <>N/A</>
}
