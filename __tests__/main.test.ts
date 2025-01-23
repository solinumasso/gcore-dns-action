/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'

import * as core from '../__fixtures__/core.js'
import { setupServer } from 'msw/node'

import { dnsRecord, subdomain, zone } from './mocks/const'
import { getFound, getNotFound } from './mocks/handlers/get'
import { deleteOK } from './mocks/handlers/delete'
import { updateOK } from './mocks/handlers/update'
import { createOK } from './mocks/handlers/create'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  let server: ReturnType<typeof setupServer>

  beforeAll(() => {
    server = setupServer()
  })

  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
    jest.resetAllMocks()
  })

  it('delete the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'api-key':
          return 'apiKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        default:
          return ''
      }
    })
    core.getBooleanInput.mockImplementation((name) => {
      switch (name) {
        case 'present':
          return false
        default:
          return false
      }
    })

    server.use(getFound, deleteOK)

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setOutput).not.toHaveBeenCalled()
    expect(core.error).not.toHaveBeenCalled()
  })

  it('update the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'api-key':
          return 'apiKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        case 'target':
          return dnsRecord.resource_records[0].content[0]
        default:
          return ''
      }
    })
    core.getBooleanInput.mockImplementation((name) => {
      switch (name) {
        case 'present':
          return true
        default:
          return false
      }
    })

    server.use(getFound, updateOK)

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'record',
      JSON.stringify(dnsRecord)
    )
    expect(core.error).not.toHaveBeenCalled()
  })

  it('create the record', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'api-key':
          return 'apiKey'
        case 'zone':
          return zone
        case 'subdomain':
          return subdomain
        case 'target':
          return dnsRecord.resource_records[0].content[0]
        default:
          return ''
      }
    })
    core.getBooleanInput.mockImplementation((name) => {
      switch (name) {
        case 'present':
          return true
        default:
          return false
      }
    })

    server.use(getNotFound, createOK)

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'record',
      JSON.stringify(dnsRecord)
    )
    expect(core.error).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    core.getInput.mockImplementation(() => '') // No inputs
    core.getBooleanInput.mockImplementation(() => false)

    await run()

    // Verify that all of the core library functions were called correctly
    expect(core.setFailed).toHaveBeenCalled()
  })
})
