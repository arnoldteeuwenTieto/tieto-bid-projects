import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RecordPlaceholder } from './pages/RecordPlaceholder'
import { Dashboard } from './pages/Dashboard'
import { Bids } from './pages/Bids'
import { Customers } from './pages/Customers'
import { Placeholder } from './pages/Placeholder'
import './styles/app.css'
export default function App() {
  return <HashRouter><Routes><Route element={<Layout />}>
    <Route index element={<Navigate to="/customers" replace />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="customers" element={<Customers />} />
    {['bid-management', 'bidrooms'].map(path => <Route key={path} path={path} element={<Placeholder />} />)}
    <Route path="bids" element={<Bids />} />
    <Route path="bids/new" element={<Bids />} />
    <Route path="bids/:recordId" element={<Bids />} />
    <Route path="projects" element={<RecordPlaceholder />} />
    <Route path="projects/:recordId" element={<RecordPlaceholder />} />
    <Route path="*" element={<Navigate to="/customers" replace />} />
  </Route></Routes></HashRouter>
}




