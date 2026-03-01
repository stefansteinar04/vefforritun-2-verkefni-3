import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

void test('GET / returns routes', async () => {
  const app = createApp()

  const res = await app.request('http://localhost/')
  assert.equal(res.status, 200)

  const json = (await res.json()) as { routes?: unknown }
  assert.ok(json.routes)
})

void test('GET /authors returns 200', async () => {
  const app = createApp()

  const res = await app.request('http://localhost/authors')
  assert.equal(res.status, 200)
})