import type { CustomerService } from './CustomerService'
import { MockCustomerService } from './MockCustomerService'
// Composition root. Replace with a backend/API adapter when an integration is agreed.
export const customerService: CustomerService = new MockCustomerService()
