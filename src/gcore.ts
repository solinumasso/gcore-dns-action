import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'
import { URL } from 'url'

export const defaultFieldType = 'CNAME'
export const defaultTTL = 600

export type DNSFieldType =
  | 'A'
  | 'AAAA'
  | 'NS'
  | 'CNAME'
  | 'MX'
  | 'TXT'
  | 'SRV'
  | 'CAA'
  | 'HTTPS'
  | 'SVCB'

export type GcoreMeta = Record<string, unknown>

export interface DNSResourceRecord {
  id: number
  content: string[]
  enabled: boolean
  meta: GcoreMeta
}

export interface DNSRecord {
  id: number
  name: string
  type: DNSFieldType
  ttl: number
  meta: GcoreMeta
  updated_at: number
  filter_set_id: unknown
  pickers: unknown
  resource_records: DNSResourceRecord[]
}

export interface GcoreError {
  error: string
  exception?: 'validation_error'
  message?: 'validation error'
  validation?: unknown[]
}

export class GcoreClient {
  private readonly client: HttpClient
  private readonly basePath: string

  constructor(
    apiKey: string,
    private readonly zone: string
  ) {
    this.client = new HttpClient('gcore-dns-github-action', undefined, {
      headers: {
        Authorization: `APIKey ${apiKey}`
      }
    })
    // Base path to control DNS records
    this.basePath = `https://api.gcore.com/dns/v2/zones/${this.zone}/`
  }

  private buildUrl(subdomain: string, fieldType: DNSFieldType): string {
    return new URL(
      `${subdomain}.${this.zone}/${fieldType}`,
      this.basePath
    ).toString()
  }

  async getSubdomainRecord(
    subdomain: string,
    fieldType: DNSFieldType
  ): Promise<false | DNSRecord> {
    try {
      const url = this.buildUrl(subdomain, fieldType)
      const results = await this.client.getJson<DNSRecord | GcoreError>(url)
      if (results.statusCode === 404) {
        return false
      }
      return results.result as DNSRecord
    } catch (error) {
      core.error(`Error getting record: ${JSON.stringify(error)}`)
      throw new Error('Error getting record', { cause: error })
    }
  }

  async createSubdomainRecord(
    subdomain: string,
    target: string,
    fieldType: DNSFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      const url = this.buildUrl(subdomain, fieldType)
      const payload = {
        ttl,
        resource_records: [
          {
            content: [target],
            enabled: true
          }
        ]
      }
      const results = await this.client.postJson<DNSRecord | GcoreError>(
        url,
        payload
      )
      if (results.statusCode !== 200) {
        throw new Error('Error creating record', { cause: results.result })
      }
      return results.result as DNSRecord
    } catch (error) {
      core.error(`Error creating record: ${JSON.stringify(error)}`)
      throw new Error('Error creating record', { cause: error })
    }
  }

  async updateSubdomainRecord(
    record: DNSRecord,
    target: string,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    try {
      const url = new URL(
        `${record.name}/${record.type}`,
        this.basePath
      ).toString()
      const payload = {
        ...record,
        ttl,
        resource_records: [
          {
            ...record.resource_records[0],
            content: [target],
            enabled: true
          }
        ]
      }
      const result = await this.client.putJson<DNSRecord | GcoreError>(
        url,
        payload
      )
      if (result.statusCode !== 200) {
        throw new Error('Error updating record', { cause: result.result })
      }
      return result.result as DNSRecord
    } catch (error) {
      core.error(`Error updating record: ${JSON.stringify(error)}`)
      throw new Error('Error updating record', { cause: error })
    }
  }

  async deleteSubdomainRecord(
    subdomain: string,
    fieldType: DNSFieldType
  ): Promise<void> {
    try {
      const record = await this.getSubdomainRecord(subdomain, fieldType)
      if (!record) {
        core.warning('No record found, nothing to delete')
        return
      }
      core.debug('Deleting record...')
      core.debug(JSON.stringify(record))
      const url = this.buildUrl(subdomain, fieldType)
      await this.client.del(url)
    } catch (error) {
      core.error(`Error deleting record: ${JSON.stringify(error)}`)
      throw new Error('Error deleting record', { cause: error })
    }
  }

  async upsertSubdomainRecord(
    subdomain: string,
    target: string,
    fieldType: DNSFieldType = defaultFieldType,
    ttl: number = defaultTTL
  ): Promise<DNSRecord> {
    const record = await this.getSubdomainRecord(subdomain, fieldType)
    if (!record) {
      core.debug('No record found, creating it...')
      return await this.createSubdomainRecord(subdomain, target, fieldType, ttl)
    }
    core.debug('Record found, updating it...')
    core.debug(JSON.stringify(record))
    return await this.updateSubdomainRecord(record, target, ttl)
  }
}
