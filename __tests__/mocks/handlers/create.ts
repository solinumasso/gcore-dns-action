import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord } from '../const'

export const createOK = http.post(
  `${baseURL}/${dnsRecord.name}/${dnsRecord.type.toUpperCase()}`,
  async ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const body = await request.json()
    if (
      typeof body === 'object' &&
      body &&
      body.ttl === dnsRecord.ttl &&
      body.resource_records &&
      Array.isArray(body.resource_records) &&
      body.resource_records.length === dnsRecord.resource_records.length &&
      body.resource_records[0].content[0] ===
        dnsRecord.resource_records[0].content[0] &&
      body.resource_records[0].enabled
    ) {
      return HttpResponse.json({ ...dnsRecord }, { status: 200 })
    }
    return HttpResponse.json({ error: 'bad request' }, { status: 400 })
  }
)
