import assert from 'node:assert/strict'
import { loadConfigFromFile, preview } from 'vite'

const development = await loadConfigFromFile({ command: 'serve', mode: 'development', isPreview: false })
assert.equal(development.config.base, '/')
const build = await loadConfigFromFile({ command: 'build', mode: 'production', isPreview: false })
assert.equal(build.config.base, '/tieto-bid-projects/')
const server = await preview({ preview: { host: '127.0.0.1', port: 0, open: false } })
try {
  const address = server.httpServer.address()
  assert.ok(address && typeof address === 'object')
  const root = `http://127.0.0.1:${address.port}`
  for (const route of ['customers', 'bids', 'bids/new?customerId=1']) {
    const response = await fetch(`${root}/tieto-bid-projects/#/${route}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes('/tieto-bid-projects/assets/'))
    const assets = [...html.matchAll(/(?:src|href)="(\/tieto-bid-projects\/assets\/[^"]+)"/g)]
    assert.ok(assets.length >= 2)
    for (const [, path] of assets) assert.equal((await fetch(root + path)).status, 200)
  }
  for (const color of ['white', 'blue']) {
    const response = await fetch(`${root}/tieto-bid-projects/branding/tieto_logo_${color}_rgb.svg`)
    assert.equal(response.status, 200)
    assert.ok(response.headers.get('content-type')?.includes('svg'))
    assert.ok((await response.text()).includes('viewBox="0 0 1199 574"'))
  }
  console.log('Pages smoke check passed: development/build base paths, hash entry URLs, built JS/CSS and both official logos.')
} finally {
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
}

