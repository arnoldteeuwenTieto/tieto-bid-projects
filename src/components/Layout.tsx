import { navigation } from '../data/navigation'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Menu, X } from 'lucide-react'
export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const title = navigation.find(item => location.pathname === `/${item.path}` || location.pathname.startsWith(`/${item.path}/`))?.label ?? 'Customers'
  return <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><img className="wordmark" src={`${import.meta.env.BASE_URL}branding/tieto_logo_white_rgb.svg`} alt="Tieto" width="1199" height="574" /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X /></button></div>
      <div className="workspace-label">BID & PROJECT SYSTEM</div>
      <nav aria-label="Main navigation">{navigation.map(({path, label, icon: Icon}) => <NavLink key={path} to={`/${path}`} title={collapsed ? label : undefined} onClick={() => setMobileOpen(false)}><Icon /><span>{label}</span>{path === 'customers' && <span className="nav-dot" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="workspace-note"><span className="note-symbol"><ArrowUpRight /></span><strong>Better together.</strong><p>From opportunity to delivery.</p></div><div className="sidebar-footer"><CircleHelp /><span>Local prototype</span><span className="version">v0.1</span></div></div>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</button>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="header-title"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></button><span>Workspace</span><ChevronRight /><strong>{title}</strong></div><div className="user"><div className="user-copy"><strong>Alex Morgan</strong><span>Workspace member</span></div><span className="avatar">AM</span><ChevronDown /></div></header><main><Outlet /></main><footer className="main-footer"><span>Tieto Bid & Project System</span><span>Built for better collaboration.</span></footer></div>
  </div>
}





