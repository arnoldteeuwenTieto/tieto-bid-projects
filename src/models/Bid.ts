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
}
export type CreateBidInput = Pick<Bid, 'customerId' | 'bidTitle' | 'stage' | 'category' | 'coOwner'>
export type UpdateBidInput = Partial<CreateBidInput>
