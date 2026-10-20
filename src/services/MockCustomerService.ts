import { initialCustomers } from '../data/customers'
import { normalizeCustomerName } from '../models/Customer'
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../models/Customer'
import type { CustomerService } from './CustomerService'

export class MockCustomerService implements CustomerService {
  private customers: Customer[]
  constructor(seed: readonly Customer[] = initialCustomers) { this.customers = seed.map(customer => ({ ...customer })) }
  async list(): Promise<Customer[]> { return this.customers.map(customer => ({ ...customer })) }
  async get(id: string): Promise<Customer | null> {
    const customer = this.customers.find(customer => customer.id === id)
    return customer ? { ...customer } : null
  }
  private validate(input: CreateCustomerInput, id?: string): CreateCustomerInput {
    const clean = { status: input.status, customerName: input.customerName.trim(), organizationNumber: input.organizationNumber.trim(), city: input.city.trim(), country: input.country.trim(), contactPerson: input.contactPerson?.trim() || undefined }
    if (!clean.customerName || !clean.organizationNumber || !clean.city || !clean.country) throw new Error('Customer name, organization number, city and country are required.')
    if (![clean.customerName, clean.organizationNumber, clean.city, clean.country, clean.contactPerson ?? ''].every(value => value.length <= 120)) throw new Error('Fields must contain at most 120 characters.')
    if (!['Active', 'Prospect', 'Inactive'].includes(clean.status)) throw new Error('Select a valid status.')
    if (this.customers.some(customer => customer.id !== id && customer.organizationNumber.toLowerCase() === clean.organizationNumber.toLowerCase())) throw new Error('This organization number already exists.')
    return clean
  }
  async create(input: CreateCustomerInput): Promise<Customer> {
    const clean = this.validate(input)
    const customer: Customer = { ...clean, id: crypto.randomUUID(), normalizedName: normalizeCustomerName(clean.customerName), sourceSystem: 'mock' }
    this.customers.push(customer)
    return { ...customer }
  }
  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const index = this.customers.findIndex(customer => customer.id === id)
    if (index === -1) throw new Error('Customer not found.')
    const clean = this.validate({ ...this.customers[index], ...input }, id)
    const customer = { ...this.customers[index], ...clean, normalizedName: normalizeCustomerName(clean.customerName) }
    this.customers[index] = customer
    return { ...customer }
  }
}

