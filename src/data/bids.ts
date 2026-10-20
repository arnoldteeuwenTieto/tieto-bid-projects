import type { Bid } from '../models/Bid'
// The first three records preserve the existing fictional customer relationships and IDs.
const bids: Bid[] = [
  { id: 'BID-DEMO-001', customerId: '1', bidTitle: 'Energy platform renewal', stage: 'Submitted', category: 'Cloud', coOwner: 'Alex Morgan', sourceSystem: 'mock' },
  { id: 'BID-DEMO-002', customerId: '1', bidTitle: 'Operations insight discovery', stage: 'Draft', category: 'Advisory', sourceSystem: 'mock' },
  { id: 'BID-DEMO-003', customerId: '2', bidTitle: 'Factory data foundation', stage: 'Won', category: 'Data', coOwner: 'Erik Strand', sourceSystem: 'mock' },
  { id: 'BID-DEMO-004', customerId: '3', bidTitle: 'Analytics discovery workshop', stage: 'In progress', category: 'Advisory', coOwner: 'Aino Lehto', sourceSystem: 'mock' },
  { id: 'BID-DEMO-005', customerId: '4', bidTitle: 'Care service data platform', stage: 'Draft', category: 'Data', sourceSystem: 'mock' },
  { id: 'BID-DEMO-006', customerId: '5', bidTitle: 'Logistics cloud transition', stage: 'Submitted', category: 'Cloud', coOwner: 'Ingrid Vale', sourceSystem: 'mock' },
  { id: 'BID-DEMO-007', customerId: '6', bidTitle: 'Digital operations support', stage: 'In progress', category: 'Managed services', coOwner: 'Alex Morgan', sourceSystem: 'mock' },
  { id: 'BID-DEMO-008', customerId: '7', bidTitle: 'Public service design study', stage: 'Won', category: 'Advisory', sourceSystem: 'mock' },
  { id: 'BID-DEMO-009', customerId: '9', bidTitle: 'Connected product insights', stage: 'Draft', category: 'Data', coOwner: 'Aino Lehto', sourceSystem: 'mock' },
  { id: 'BID-DEMO-010', customerId: '10', bidTitle: 'Retail infrastructure refresh', stage: 'Lost', category: 'Cloud', sourceSystem: 'mock' },
  { id: 'BID-DEMO-011', customerId: '11', bidTitle: 'Infrastructure support programme', stage: 'Submitted', category: 'Managed services', coOwner: 'Erik Strand', sourceSystem: 'mock' },
  { id: 'BID-DEMO-012', customerId: '12', bidTitle: 'Communications cloud assessment', stage: 'In progress', category: 'Cloud', coOwner: 'Ingrid Vale', sourceSystem: 'mock' },
]

// Explicit fictional financial/engagement metadata, keyed to the original records.
const metadata: Record<string, Partial<Bid>> = {
  'BID-DEMO-001': { estimatedValue: 2400000, currency: 'NOK', probability: 0.65, createdDate: '2026-08-12', expectedDecisionDate: '2026-11-04', lastActivityDate: '2026-10-12', nextActionDate: '2026-10-24', bidOwnerId: 'demo-owner-1' },
  'BID-DEMO-002': { estimatedValue: 450000, currency: 'NOK', probability: 0.25, createdDate: '2026-09-01', expectedDecisionDate: '2026-12-10', lastActivityDate: '2026-09-01', nextActionDate: '2026-10-15', bidOwnerId: 'demo-owner-1' },
  'BID-DEMO-003': { estimatedValue: 1800000, currency: 'SEK', probability: 1, createdDate: '2026-03-01', actualCloseDate: '2026-09-28', lastActivityDate: '2026-09-28', bidOwnerId: 'demo-owner-2' },
  'BID-DEMO-004': { estimatedValue: 85000, currency: 'EUR', probability: 0.4, createdDate: '2026-07-18', expectedDecisionDate: '2026-10-30', lastActivityDate: '2026-10-10', nextActionDate: '2026-10-19', bidOwnerId: 'demo-owner-3' },
  'BID-DEMO-005': { estimatedValue: 3200000, currency: 'NOK', probability: 0.2, createdDate: '2026-10-01', expectedDecisionDate: '2027-01-15', lastActivityDate: '2026-10-05', nextActionDate: '2026-10-28', bidOwnerId: 'demo-owner-1' },
  'BID-DEMO-006': { estimatedValue: 160000, currency: 'EUR', probability: 0.7, createdDate: '2026-06-04', expectedDecisionDate: '2026-11-12', lastActivityDate: '2026-08-01', nextActionDate: '2026-10-16', bidOwnerId: 'demo-owner-4' },
  'BID-DEMO-007': { estimatedValue: 1250000, currency: 'NOK', probability: 0.45, createdDate: '2026-09-15', expectedDecisionDate: '2026-12-02', lastActivityDate: '2026-10-14', nextActionDate: '2026-10-25', bidOwnerId: 'demo-owner-1' },
  'BID-DEMO-008': { estimatedValue: 950000, currency: 'SEK', probability: 1, createdDate: '2026-02-02', actualCloseDate: '2026-08-18', lastActivityDate: '2026-08-18', bidOwnerId: 'demo-owner-2' },
  'BID-DEMO-009': { createdDate: '2026-10-08', expectedDecisionDate: '2026-12-15', lastActivityDate: '2026-10-08', bidOwnerId: 'demo-owner-3' },
  'BID-DEMO-010': { estimatedValue: 120000, currency: 'EUR', probability: 0, createdDate: '2026-05-01', actualCloseDate: '2026-10-03', lastActivityDate: '2026-10-03', bidOwnerId: 'demo-owner-4' },
  'BID-DEMO-011': { estimatedValue: 2100000, currency: 'SEK', probability: 0.6, createdDate: '2026-08-20', expectedDecisionDate: '2026-11-06', lastActivityDate: '2026-09-02', nextActionDate: '2026-10-18', bidOwnerId: 'demo-owner-2' },
  'BID-DEMO-012': { estimatedValue: 190000, currency: 'EUR', probability: 0.4, createdDate: '2026-09-25', expectedDecisionDate: '2026-11-16', lastActivityDate: '2026-10-16', nextActionDate: '2026-10-26', bidOwnerId: 'demo-owner-3' },
}
export const initialBids: readonly Bid[] = bids.map(bid => ({ ...bid, ...metadata[bid.id] }))
