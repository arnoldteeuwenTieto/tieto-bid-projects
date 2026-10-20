import { normalizeCustomerName } from '../models/Customer'
import type { Customer, CustomerStatus } from '../models/Customer'
export type { Customer, CustomerStatus } from '../models/Customer'
interface LegacyCustomer { id: string; name: string; organizationNumber: string; country: string; contact: string; status: CustomerStatus }
const cities = ['Oslo', 'Stockholm', 'Helsinki', 'Bergen', 'Copenhagen', 'Trondheim', 'Gothenburg', 'Stavanger', 'Espoo', 'Aarhus', 'Malmö', 'Tampere', 'Oslo', 'Manchester', 'Uppsala']
export function fromLegacyCustomer(customer: LegacyCustomer, city = ''): Customer {
  return { id: customer.id, customerName: customer.name, normalizedName: normalizeCustomerName(customer.name), organizationNumber: customer.organizationNumber, city, country: customer.country, contactPerson: customer.contact, status: customer.status, sourceSystem: 'mock' }
}
const legacyCustomers: LegacyCustomer[] = [
  ['1', 'Aurora Energy AS', 'FIC-NO-1001', 'Norway', 'Ingrid Solberg', 'Active'],
  ['2', 'Bergvik Industries AB', 'FIC-SE-1002', 'Sweden', 'Erik Lindström', 'Active'],
  ['3', 'Cobalt Digital Oy', 'FIC-FI-1003', 'Finland', 'Aino Korhonen', 'Prospect'],
  ['4', 'Dalen Healthcare AS', 'FIC-NO-1004', 'Norway', 'Lars Johansen', 'Active'],
  ['5', 'Evergreen Logistics A/S', 'FIC-DK-1005', 'Denmark', 'Sofie Nielsen', 'Active'],
  ['6', 'Fjord Financial Group', 'FIC-NO-1006', 'Norway', 'Henrik Berg', 'Prospect'],
  ['7', 'Granite Public Services AB', 'FIC-SE-1007', 'Sweden', 'Emma Andersson', 'Active'],
  ['8', 'Havik Maritime AS', 'FIC-NO-1008', 'Norway', 'Magnus Dahl', 'Inactive'],
  ['9', 'Ivalo Technology Oy', 'FIC-FI-1009', 'Finland', 'Mikko Laine', 'Active'],
  ['10', 'Juniper Retail A/S', 'FIC-DK-1010', 'Denmark', 'Clara Jensen', 'Prospect'],
  ['11', 'Klint Infrastructure AB', 'FIC-SE-1011', 'Sweden', 'Oscar Holm', 'Active'],
  ['12', 'Lumi Communications Oy', 'FIC-FI-1012', 'Finland', 'Ella Virtanen', 'Active'],
  ['13', 'Nordhaven Mobility AS', 'FIC-NO-1013', 'Norway', 'Nora Bakken', 'Prospect'],
  ['14', 'Oakbridge Solutions Ltd', 'FIC-GB-1014', 'United Kingdom', 'Oliver Reed', 'Inactive'],
  ['15', 'Polaris Manufacturing AB', 'FIC-SE-1015', 'Sweden', 'Alice Nyström', 'Active'],
].map(([id, name, organizationNumber, country, contact, status]) => ({ id, name, organizationNumber, country, contact, status: status as CustomerStatus }))

export const initialCustomers = legacyCustomers.map((customer, index) => fromLegacyCustomer(customer, cities[index]))
