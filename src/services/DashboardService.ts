import type { CustomerService } from './CustomerService'
import type { BidService } from './BidService'
import { customerService } from './customers'
import { bidService } from './bids'
export class DashboardService {
  private readonly customers: CustomerService
  private readonly bids: BidService
  constructor(customers = customerService, bids = bidService) { this.customers = customers; this.bids = bids }
  async snapshot() {
    const [customers, bids] = await Promise.all([this.customers.list(), this.bids.list()])
    return { customers, bids }
  }
}
export const dashboardService = new DashboardService()
