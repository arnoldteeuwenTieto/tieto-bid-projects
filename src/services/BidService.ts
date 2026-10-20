import type { Bid, CreateBidInput, UpdateBidInput } from '../models/Bid'
export interface BidService {
  list(): Promise<Bid[]>
  get(id: string): Promise<Bid | null>
  create(input: CreateBidInput): Promise<Bid>
  update(id: string, input: UpdateBidInput): Promise<Bid>
}
