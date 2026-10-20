import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../models/Customer'

/** Adapter boundary: canonical IDs in and out; no transport or source-specific IDs in UI. */
export interface CustomerService {
  list(): Promise<Customer[]>
  get(id: string): Promise<Customer | null>
  create(input: CreateCustomerInput): Promise<Customer>
  update(id: string, input: UpdateCustomerInput): Promise<Customer>
}
