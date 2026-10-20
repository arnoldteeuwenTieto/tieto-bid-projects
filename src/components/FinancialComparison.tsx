import { MoneyValues } from './DashboardCards'
export function FinancialComparison({ unweighted, weighted }: { unweighted: Record<string, number>; weighted: Record<string, number> }) {
  const currencies = Object.keys(unweighted).sort()
  if (!currencies.length) return <p className="dashboard-empty">Data not available. No valued open bids in this scope.</p>
  return <div className="financial-comparisons">{currencies.map(currency => {
    const estimated = unweighted[currency]
    const expected = weighted[currency]
    const scale = Math.max(estimated, expected ?? 0)
    return <section key={currency} className="currency-comparison" aria-label={`${currency} pipeline comparison`}>
      <div className="currency-heading"><h3>{currency}</h3><span>Independent currency scale</span></div>
      {[{ label: 'Unweighted', value: estimated, className: 'unweighted' }, { label: 'Weighted', value: expected, className: 'weighted' }].map(({ label, value, className }) => <div key={label} className="financial-bar-row"><div className="financial-bar-label"><span>{label}</span><strong>{value === undefined ? 'N/A' : <MoneyValues totals={{ [currency]: value }} />}</strong></div><div className="financial-bar-track" aria-hidden="true"><span className={className} style={{ width: `${value === undefined || scale === 0 ? 0 : value / scale * 100}%` }} /></div></div>)}
    </section>
  })}<p className="dashboard-explanation">Bars compare weighted and unweighted values within each currency only. Bar lengths cannot be compared across currencies.</p></div>
}
