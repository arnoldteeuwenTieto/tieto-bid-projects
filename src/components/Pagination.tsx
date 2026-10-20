import { ChevronLeft, ChevronRight } from 'lucide-react'
export function Pagination({ page, total, pageSize, onChange, noun }: { page: number; total: number; pageSize: number; onChange: (page: number) => void; noun: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  // Keep navigation bounded even when a future adapter returns many records.
  const visiblePages = Array.from(new Set([1, page - 1, page, page + 1, pages])).filter(value => value >= 1 && value <= pages).sort((a, b) => a - b)
  return <div className="table-footer"><span>Showing <strong>{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> {noun}</span><div className="pagination"><button aria-label="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft /></button>{visiblePages.map(value => <button key={value} className={page === value ? 'current' : ''} aria-label={`Page ${value}`} aria-current={page === value ? 'page' : undefined} onClick={() => onChange(value)}>{value}</button>)}<button aria-label="Next page" disabled={page === pages} onClick={() => onChange(page + 1)}><ChevronRight /></button></div></div>
}
