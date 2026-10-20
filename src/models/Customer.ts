export type CustomerStatus = 'Active' | 'Prospect' | 'Inactive'
export type SourceSystem = 'mock' | 'sharepoint' | 'crm'

export interface Customer {
  /** Canonical application ID. Never use a source list item ID here. */
  id: string
  customerName: string
  normalizedName: string
  organizationNumber: string
  city: string
  country: string
  contactPerson?: string
  status: CustomerStatus
  sourceSystem: SourceSystem
  externalId?: string
  /** Untrusted until checked against the configured library URL policy. */
  documentLibraryUrl?: string
}
export type CreateCustomerInput = Pick<Customer, 'customerName' | 'organizationNumber' | 'city' | 'country' | 'contactPerson' | 'status'>
export type UpdateCustomerInput = Partial<CreateCustomerInput>

export function normalizeCustomerName(name: string): string {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')
}

/** Field mapping only; caller supplies the canonical ID from an identity registry. */
export interface PowerAppsCustomerFields {
  CustomerName: string
  NormalisedName?: string
  Organisasjonsnummer: string
  ForretningsadressePoststed?: string
}
export function mapPowerAppsCustomer(
  fields: PowerAppsCustomerFields,
  identity: Pick<Customer, 'id' | 'sourceSystem' | 'externalId'>,
  attributes: Pick<Customer, 'country' | 'status'> & Partial<Pick<Customer, 'contactPerson' | 'documentLibraryUrl'>>,
): Customer {
  return {
    ...attributes, ...identity,
    customerName: fields.CustomerName,
    normalizedName: fields.NormalisedName?.trim() || normalizeCustomerName(fields.CustomerName),
    organizationNumber: fields.Organisasjonsnummer,
    city: fields.ForretningsadressePoststed ?? '',
  }
}
