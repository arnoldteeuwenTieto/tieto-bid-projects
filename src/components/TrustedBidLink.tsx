import { ExternalLink } from 'lucide-react'
import { validateLibraryUrl } from '../utils/libraryUrl'
// Teams has a separate, deny-by-default policy; no guessed production URLs or hosts.
const trustedTeamsOrigins: readonly string[] = []
export function TrustedBidLink({ url, kind }: { url?: string; kind: 'library' | 'teams' }) {
  const trusted = kind === 'library' ? validateLibraryUrl(url) : validateLibraryUrl(url, trustedTeamsOrigins)
  const label = kind === 'library' ? 'Open SharePoint library' : 'Open Teams'
  return trusted ? <a className="secondary-button" href={trusted} target="_blank" rel="noopener noreferrer">{label}<ExternalLink /></a> : <button className="secondary-button" disabled title="No trusted URL is configured">{label}<ExternalLink /></button>
}
