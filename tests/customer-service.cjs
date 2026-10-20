// Compile TypeScript in memory using the existing dev dependency; no production loader.
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename)
}
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { MockCustomerService } = require('../src/services/MockCustomerService.ts')
const { mapPowerAppsCustomer } = require('../src/models/Customer.ts')
const { validateLibraryUrl } = require('../src/utils/libraryUrl.ts')
const { mockProjects } = require('../src/data/relationships.ts')
const { initialBids } = require('../src/data/bids.ts')
const input = { customerName: '  Example   Demo AS  ', organizationNumber: ' FIC-TEST-001 ', city: ' Oslo ', country: ' Norway ', status: 'Prospect' }

test('preserves all seed IDs and returns isolated copies', async () => {
  const service = new MockCustomerService()
  const customers = await service.list()
  assert.equal(customers.length, 15)
  assert.equal(customers[0].id, '1')
  assert.equal(customers[0].customerName, 'Aurora Energy AS')
  customers[0].customerName = 'Changed'
  assert.equal((await service.get('1')).customerName, 'Aurora Energy AS')
  assert.equal(await service.get('missing'), null)
  for (const record of [...initialBids, ...mockProjects]) assert.ok(await service.get(record.customerId))
})

test('create and update keep canonical identity, normalize names and reject duplicates', async () => {
  const service = new MockCustomerService([])
  const created = await service.create(input)
  assert.ok(created.id)
  assert.equal(created.sourceSystem, 'mock')
  assert.equal(created.normalizedName, 'example demo as')
  assert.equal(created.city, 'Oslo')
  assert.equal(created.contactPerson, undefined)
  await assert.rejects(service.create({ ...input, organizationNumber: 'fic-test-001' }), /already exists/)
  const updated = await service.update(created.id, { customerName: 'Renamed Demo', status: 'Active' })
  assert.equal(updated.id, created.id)
  assert.equal(updated.normalizedName, 'renamed demo')
  assert.equal(updated.status, 'Active')
  updated.city = 'Changed'
  assert.equal((await service.get(created.id)).city, 'Oslo')
  const second = await service.create({ ...input, organizationNumber: 'FIC-TEST-002' })
  await assert.rejects(service.update(second.id, { organizationNumber: 'FIC-TEST-001' }), /already exists/)
  await assert.rejects(service.create({ ...input, city: ' ' }), /required/)
  await assert.rejects(service.update('missing', { status: 'Active' }), /not found/)
})

test('updates preserve source metadata and never replace canonical IDs with external IDs', async () => {
  const service = new MockCustomerService([{ ...input, id: 'app-customer-001', normalizedName: 'example demo as', sourceSystem: 'sharepoint', externalId: '42' }])
  const updated = await service.update('app-customer-001', { city: 'Bergen' })
  assert.equal(updated.id, 'app-customer-001')
  assert.equal(updated.externalId, '42')
  assert.equal(updated.sourceSystem, 'sharepoint')
})

test('Power Apps mapping uses supplied canonical identity and original field names', () => {
  const customer = mapPowerAppsCustomer({ CustomerName: 'Demo AS', NormalisedName: 'demo', Organisasjonsnummer: 'FIC-TEST', ForretningsadressePoststed: 'Oslo' }, { id: 'app-123', sourceSystem: 'sharepoint', externalId: '27' }, { country: 'Norway', status: 'Active' })
  assert.equal(customer.id, 'app-123')
  assert.equal(customer.externalId, '27')
  assert.equal(customer.city, 'Oslo')
  assert.equal(customer.normalizedName, 'demo')
})

test('library URLs fail closed unless HTTPS and exact trusted origin match', () => {
  const origins = ['https://libraries.example.test']
  assert.equal(validateLibraryUrl('https://libraries.example.test/docs'), null)
  assert.equal(validateLibraryUrl('https://libraries.example.test/docs', origins), 'https://libraries.example.test/docs')
  for (const url of [undefined, '', '/docs', 'javascript:alert(1)', 'http://libraries.example.test/docs', 'https://libraries.example.test.evil.test/docs', 'https://user:pass@libraries.example.test/docs', 'https://libraries.example.test:444/docs']) assert.equal(validateLibraryUrl(url, origins), null)
})


const { MockBidService } = require('../src/services/MockBidService.ts')
const { selectBids } = require('../src/utils/bidQuery.ts')
const bidInput = { customerId: '1', bidTitle: '  Fictional cloud assessment  ', stage: 'Draft', category: 'Cloud' }
const query = { search: '', customerId: null, stage: '', category: '', sortKey: 'bidTitle', ascending: true }

test('bid seeds preserve original customer links, are isolated and have stable IDs', async () => {
  const customers = new MockCustomerService()
  const service = new MockBidService(customers)
  const bids = await service.list()
  assert.equal(bids.length, 12)
  assert.equal(bids[0].id, 'BID-DEMO-001')
  assert.equal(bids[0].customerId, '1')
  assert.equal(bids[0].stage, 'Submitted')
  assert.equal(bids[2].stage, 'Won')
  bids[0].bidTitle = 'Changed'
  assert.equal((await service.get('BID-DEMO-001')).bidTitle, 'Energy platform renewal')
  assert.equal(await service.get('missing'), null)
  for (const bid of bids) assert.ok(await customers.get(bid.customerId))
})

test('create/edit bids validates customer and options and preserves source identity', async () => {
  const customers = new MockCustomerService()
  const service = new MockBidService(customers, [])
  const created = await service.create(bidInput)
  assert.equal(created.bidTitle, 'Fictional cloud assessment')
  assert.equal(created.coOwner, undefined)
  assert.equal(created.sourceSystem, 'mock')
  assert.ok(created.id)
  await assert.rejects(service.create({ ...bidInput, customerId: 'missing' }), /no longer exists/)
  await assert.rejects(service.create({ ...bidInput, bidTitle: ' ' }), /required/)
  await assert.rejects(service.create({ ...bidInput, stage: 'Unapproved stage' }), /valid demo stage/)
  await assert.rejects(service.create({ ...bidInput, category: 'Unapproved category' }), /valid demo category/)
  await assert.rejects(service.create({ ...bidInput, coOwner: 'Unknown' }), /valid demo co-owner/)
  const updated = await service.update(created.id, { customerId: '2', bidTitle: 'Updated fictional title', stage: 'Won', coOwner: 'Alex Morgan' })
  assert.equal(updated.id, created.id)
  assert.equal(updated.customerId, '2')
  assert.equal(updated.stage, 'Won')
  assert.equal(updated.coOwner, 'Alex Morgan')
  assert.equal((await service.list()).filter(bid => bid.customerId === '1').length, 0)
  assert.equal((await service.list()).filter(bid => bid.customerId === '2').length, 1)
  await service.update(created.id, { coOwner: undefined })
  assert.equal((await service.get(created.id)).coOwner, undefined)
  const importedService = new MockBidService(customers, [{ ...updated, externalId: 'sp-42', sourceSystem: 'sharepoint' }])
  const imported = await importedService.update(created.id, { stage: 'Draft' })
  assert.equal(imported.externalId, 'sp-42')
  assert.equal(imported.sourceSystem, 'sharepoint')
  await assert.rejects(service.update('missing', { stage: 'Won' }), /not found/)
})

test('bid query searches linked customer names and titles, combines filters and sorts', async () => {
  const customers = await new MockCustomerService().list()
  assert.equal(selectBids(initialBids, customers, { ...query, search: ' AURORA ' }).length, 2)
  assert.equal(selectBids(initialBids, customers, { ...query, search: 'factory data' })[0].id, 'BID-DEMO-003')
  const filtered = selectBids(initialBids, customers, { ...query, customerId: '1', stage: 'Submitted', category: 'Cloud' })
  assert.deepEqual(filtered.map(bid => bid.id), ['BID-DEMO-001'])
  assert.equal(selectBids(initialBids, customers, { ...query, customerId: 'missing' }).length, 0)
  assert.equal(selectBids(initialBids, customers, { ...query, search: 'no matches' }).length, 0)
  const ascending = selectBids(initialBids, customers, { ...query, sortKey: 'customerName' })
  const descending = selectBids(initialBids, customers, { ...query, sortKey: 'customerName', ascending: false })
  assert.deepEqual(ascending.map(bid => bid.id), descending.map(bid => bid.id).reverse())
  assert.equal(selectBids([], customers, query).length, 0)
})
