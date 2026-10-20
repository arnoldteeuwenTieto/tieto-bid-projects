import { customerService } from './customers'
import { MockBidService } from './MockBidService'
import type { BidService } from './BidService'
// Shared instance: overview, customer relationships and details use the same records.
export const bidService: BidService = new MockBidService(customerService)
