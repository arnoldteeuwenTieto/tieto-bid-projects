import type { Bid } from '../models/Bid'
// The first three records preserve the existing fictional customer relationships and IDs.
export const initialBids: readonly Bid[] = [
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
