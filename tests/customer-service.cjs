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

const { analyzeDashboard, groupMoney, validDate } = require('../src/analytics/dashboard.ts')
const { DashboardService } = require('../src/services/DashboardService.ts')
const filters = { period: 'all', customerId: '', stage: '', category: '' }
const today = '2026-10-20'
const sampleBid = (id, stage, extra = {}) => ({ id, customerId: '1', bidTitle: id, stage, category: 'Cloud', sourceSystem: 'mock', createdDate: '2026-10-01', ...extra })

test('dashboard empty data and open-only win rate return N/A without division by zero', () => {
  const empty = analyzeDashboard([], [], filters, today)
  assert.equal(empty.winRate, null)
  assert.equal(empty.open.length, 0)
  assert.equal(empty.portfolio.length, 0)
  assert.deepEqual(empty.pipeline.totals, {})
  assert.deepEqual(empty.stages.map(item => item.count), [0, 0, 0])
  assert.equal(analyzeDashboard([], [sampleBid('a', 'Draft')], filters, today).winRate, null)
})

test('win rate uses only won and lost, with actual close dates for period filtering', () => {
  const bids = [sampleBid('won', 'Won', { createdDate: '2025-01-01', actualCloseDate: '2026-10-10' }), sampleBid('lost', 'Lost', { actualCloseDate: '2026-09-01' }), sampleBid('open', 'Draft'), sampleBid('undated', 'Won')]
  assert.equal(analyzeDashboard([], bids, filters, today).winRate, 2 / 3)
  const period = analyzeDashboard([], bids, { ...filters, period: '30' }, today)
  assert.equal(period.winRate, 1)
  assert.equal(period.won, 1)
  assert.equal(period.lost, 0)
  assert.equal(period.missingClosed, 1)
  const lostOnly = analyzeDashboard([], [sampleBid('lost', 'Lost')], filters, today)
  assert.equal(lostOnly.winRate, 0)
})

test('financial totals separate currencies, exclude closed bids and validate probabilities', () => {
  const bids = [
    sampleBid('nok', 'Draft', { estimatedValue: 100, currency: 'NOK', probability: 0.25 }),
    sampleBid('eur', 'Submitted', { estimatedValue: 200, currency: 'EUR', probability: 0.5 }),
    sampleBid('invalid-p', 'Draft', { estimatedValue: 300, currency: 'NOK', probability: 1.1 }),
    sampleBid('zero', 'Draft', { estimatedValue: 0, currency: 'NOK', probability: 0 }),
    sampleBid('won', 'Won', { estimatedValue: 9999, currency: 'NOK', probability: 1 }),
    sampleBid('missing', 'Draft'), sampleBid('negative', 'Draft', { estimatedValue: -20, currency: 'NOK', probability: 0.5 }),
    sampleBid('invalid-currency', 'Draft', { estimatedValue: 20, currency: 'ZZZ', probability: 0.5 }),
    sampleBid('infinite', 'Draft', { estimatedValue: Infinity, currency: 'NOK', probability: 0.5 }),
  ]
  const result = analyzeDashboard([], bids, filters, today)
  assert.deepEqual(result.pipeline.totals, { NOK: 400, EUR: 200 })
  assert.deepEqual(result.weighted.totals, { NOK: 25, EUR: 100 })
  assert.equal(result.pipeline.included, 4)
  assert.equal(result.weighted.included, 3)
  assert.equal(groupMoney([sampleBid('none', 'Draft')]).included, 0)
})

test('creation cohort and customer/stage/category filters consistently affect open metrics', async () => {
  const customers = await new MockCustomerService().list()
  const bids = [sampleBid('recent', 'Draft', { estimatedValue: 100, currency: 'NOK', probability: 0.5 }), sampleBid('old', 'Draft', { createdDate: '2025-01-01' }), sampleBid('undated', 'Draft', { createdDate: undefined }), sampleBid('other', 'Submitted', { customerId: '2' }), sampleBid('category', 'Draft', { category: 'Data' })]
  const scoped = { ...filters, period: '30', customerId: '1', stage: 'Draft', category: 'Cloud' }
  const result = analyzeDashboard(customers, bids, scoped, today)
  assert.deepEqual(result.open.map(bid => bid.id), ['recent'])
  assert.equal(result.pipeline.totals.NOK, 100)
  assert.equal(result.withOpen.length, 1)
  assert.equal(result.activeCustomers.length, 1)
  assert.equal(result.missingCreated, 1)
  const linked = selectBids(bids, customers, { ...query, customerId: '1', stage: 'Draft', category: 'Cloud', scope: 'open', createdFrom: result.from, createdTo: today })
  assert.deepEqual(linked.map(bid => bid.id), result.open.map(bid => bid.id))
})

test('engagement uses explicit contact/activity dates and handles unknown dates separately', async () => {
  const customer = (await new MockCustomerService().get('1'))
  const customers = [{ ...customer, lastContactDate: '2026-01-01' }, { ...customer, id: '2', lastContactDate: undefined }, { ...customer, id: '3', lastContactDate: '2027-01-01' }]
  const bids = [sampleBid('attention', 'Draft', { expectedDecisionDate: '2026-10-25', nextActionDate: '2026-10-19', lastActivityDate: '2026-08-01' }), sampleBid('unknown', 'Draft'), sampleBid('closed', 'Won', { nextActionDate: '2026-01-01' })]
  const result = analyzeDashboard(customers, bids, filters, today)
  assert.equal(result.bidAttention.length, 1)
  assert.equal(result.bidAttention[0].reasons.length, 3)
  assert.equal(result.withoutContact.length, 1)
  assert.equal(result.unknownContact.length, 2)
  assert.equal(result.missingActivity, 1)
  assert.equal(result.withoutOpen.length, 2)
  assert.equal(validDate('2026-02-30'), null)
  assert.equal(validDate('2026-02-28'), '2026-02-28')
})

test('dashboard reads the same services after bid edits and new customer creation', async () => {
  const customers = new MockCustomerService()
  const bids = new MockBidService(customers, [])
  const service = new DashboardService(customers, bids)
  const bid = await bids.create(bidInput)
  let snapshot = await service.snapshot()
  assert.equal(analyzeDashboard(snapshot.customers, snapshot.bids, filters, today).open.length, 1)
  await bids.update(bid.id, { stage: 'Won' })
  const newCustomer = await customers.create({ ...input, organizationNumber: 'FIC-DASH-001' })
  snapshot = await service.snapshot()
  const result = analyzeDashboard(snapshot.customers, snapshot.bids, filters, today)
  assert.equal(result.open.length, 0)
  assert.equal(result.winRate, 1)
  assert.ok(result.portfolio.some(customer => customer.id === newCustomer.id))
})
