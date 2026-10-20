import { initialBids } from '../data/bids'
import { bidStages, bidCategories, bidCoOwners } from '../config/bidOptions'
import type { Bid, CreateBidInput, UpdateBidInput } from '../models/Bid'
import type { CustomerService } from './CustomerService'
import type { BidService } from './BidService'

export class MockBidService implements BidService {
  private bids: Bid[]
  private readonly customers: CustomerService
  constructor(customers: CustomerService, seed: readonly Bid[] = initialBids) {
    this.customers = customers
    this.bids = seed.map(bid => ({ ...bid }))
  }
  async list(): Promise<Bid[]> { return this.bids.map(bid => ({ ...bid })) }
  async get(id: string): Promise<Bid | null> {
    const bid = this.bids.find(bid => bid.id === id)
    return bid ? { ...bid } : null
  }
  private async validate(input: CreateBidInput): Promise<CreateBidInput> {
    const clean = { customerId: input.customerId.trim(), bidTitle: input.bidTitle.trim(), stage: input.stage, category: input.category, coOwner: input.coOwner?.trim() || undefined }
    if (!clean.customerId || !clean.bidTitle || !clean.stage || !clean.category) throw new Error('Customer, bid title, stage and category are required.')
    if (clean.bidTitle.length > 160) throw new Error('Bid title must contain at most 160 characters.')
    if (!bidStages.some(stage => stage === clean.stage)) throw new Error('Select a valid demo stage.')
    if (!bidCategories.some(category => category === clean.category)) throw new Error('Select a valid demo category.')
    if (clean.coOwner && !bidCoOwners.some(owner => owner === clean.coOwner)) throw new Error('Select a valid demo co-owner.')
    if (!await this.customers.get(clean.customerId)) throw new Error('Selected customer no longer exists.')
    return clean
  }
  async create(input: CreateBidInput): Promise<Bid> {
    const clean = await this.validate(input)
    const bid: Bid = { ...clean, id: crypto.randomUUID(), sourceSystem: 'mock' }
    this.bids.push(bid)
    return { ...bid }
  }
  async update(id: string, input: UpdateBidInput): Promise<Bid> {
    const current = this.bids.find(bid => bid.id === id)
    if (!current) throw new Error('Bid not found.')
    const clean = await this.validate({ ...current, ...input })
    const updated = { ...current, ...clean }
    this.bids[this.bids.findIndex(bid => bid.id === id)] = updated
    return { ...updated }
  }
}

