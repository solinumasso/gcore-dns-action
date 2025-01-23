import * as core from '@actions/core'

import {
  defaultFieldType,
  defaultTTL,
  DNSFieldType,
  GcoreClient
} from './gcore'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Gcore client inputs
    const apiKey: string = core.getInput('api-key', {
      required: true
    })
    if (!apiKey?.length) {
      core.setFailed('Gcore API key is required')
      return
    }
    core.setSecret(apiKey)

    const zone: string = core.getInput('zone', { required: true })
    if (!zone?.length) {
      core.setFailed('zone is required')
      return
    }
    const subdomain: string = core.getInput('subdomain', { required: true })
    if (!subdomain?.length) {
      core.setFailed('subdomain is required')
      return
    }
    const present: boolean = core.getBooleanInput('present', { required: true })

    // Create an Gcore client
    const client = new GcoreClient(apiKey, zone)

    const rawFieldType: string = core.getInput('type')
    const fieldType: DNSFieldType = rawFieldType.length
      ? (rawFieldType as DNSFieldType)
      : defaultFieldType

    if (present) {
      const target: string = core.getInput('target', { required: true })
      const rawTtl: string = core.getInput('ttl')
      const ttl = rawTtl.length ? parseInt(rawTtl, 10) : defaultTTL
      const record = await client.upsertSubdomainRecord(
        subdomain,
        target,
        fieldType,
        ttl
      )

      // Set outputs for other workflow steps to use
      core.setOutput('record', JSON.stringify(record))
    } else {
      await client.deleteSubdomainRecord(subdomain, fieldType)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
