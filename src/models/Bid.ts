import type { SourceSystem } from './Customer'
// Strings at the adapter boundary allow future source choices without changing the model.
export interface Bid {
  id: string
  customerId: string
  bidTitle: string
  stage: string
  category: string
  coOwner?: string
  documentLibraryUrl?: string
  teamsUrl?: string
  sourceSystem: SourceSystem
  externalId?: string
  estimatedValue?: number
  currency?: string
  /** Explicit demo assumption, expressed as a fraction from 0 to 1. */
  probability?: number
  createdDate?: string
  expectedDecisionDate?: string
  actualCloseDate?: string
  lastActivityDate?: string
  nextActionDate?: string
  bidOwnerId?: string
}
export type CreateBidInput = Pick<Bid, 'customerId' | 'bidTitle' | 'stage' | 'category' | 'coOwner'>
export type UpdateBidInput = Partial<CreateBidInput>

