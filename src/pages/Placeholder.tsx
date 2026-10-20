import { ArrowRight, Construction } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navigation } from '../data/navigation'
export function Placeholder() {
  const location = useLocation()
  const title = navigation.find(item => `/${item.path}` === location.pathname)?.label
  return <><div className="page-heading"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>{title}</h1><p>Everything you need to move work forward.</p></div></div><section className="placeholder card"><span className="placeholder-icon"><Construction /></span><h2>A new space for {title?.toLowerCase()}</h2><p>This area is coming in a future version. Start exploring your customer workspace today.</p><Link className="primary-button" to="/customers">Explore customers <ArrowRight /></Link></section></>
}


