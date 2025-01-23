/**
 * Unit tests for src/gcore.ts
 */
import { jest } from '@jest/globals'

import * as core from '../__fixtures__/core.js'
import { expect } from '@jest/globals'
import { setupServer } from 'msw/node'

import { GcoreClient } from '../src/gcore'

import { getFound, getNotFound } from './mocks/handlers/get'
import { dnsRecord, subdomain, zone } from './mocks/const'
import { createOK } from './mocks/handlers/create'
import { updateOK } from './mocks/handlers/update'
import { deleteOK } from './mocks/handlers/delete'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

describe('gcore.ts GcoreClient', () => {
  let client: GcoreClient
  let server: ReturnType<typeof setupServer>

  beforeAll(() => {
    server = setupServer()
  })

  beforeEach(() => {
    jest.clearAllMocks()

    server.listen({ onUnhandledRequest: 'error' })
    client = new GcoreClient('apiKey', zone)
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
    jest.restoreAllMocks()
  })

  it('getSubdomainRecord returns false if no record found', async () => {
    server.use(getNotFound)
    const result = await client.getSubdomainRecord(subdomain, 'CNAME')
    expect(result).toBe(false)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('getSubdomainRecord returns record if found', async () => {
    server.use(getFound)
    const result = await client.getSubdomainRecord(subdomain, 'CNAME')
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('createSubdomainRecord creates a new record', async () => {
    server.use(createOK)
    const result = await client.createSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.resource_records[0].content[0],
      'CNAME'
    )
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('createSubdomainRecord creates a new record, with TTL', async () => {
    server.use(createOK)
    const result = await client.createSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.resource_records[0].content[0],
      'CNAME',
      600
    )
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('updateSubdomainRecord updates an existing record', async () => {
    server.use(getFound, updateOK)
    const result = await client.updateSubdomainRecord(
      dnsRecord,
      dnsRecord.resource_records[0].content[0]
    )
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('deleteSubdomainRecord deletes an existing record', async () => {
    server.use(getFound, deleteOK)
    await client.deleteSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.type
    )
    expect(core.error).not.toHaveBeenCalled()
  })

  it('deleteSubdomainRecord deletes a non-existing record', async () => {
    server.use(getNotFound)
    await client.deleteSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.type
    )
    expect(core.error).not.toHaveBeenCalled()
  })

  it('upsertSubdomainRecord creates a new record if none exists', async () => {
    server.use(getNotFound, createOK)
    const result = await client.upsertSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.resource_records[0].content[0],
      dnsRecord.type
    )
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })

  it('upsertSubdomainRecord updates an existing record if found', async () => {
    server.use(getFound, updateOK)
    const result = await client.upsertSubdomainRecord(
      dnsRecord.name.split('.')[0],
      dnsRecord.resource_records[0].content[0],
      dnsRecord.type
    )
    expect(result).toEqual(dnsRecord)
    expect(core.error).not.toHaveBeenCalled()
  })
})
