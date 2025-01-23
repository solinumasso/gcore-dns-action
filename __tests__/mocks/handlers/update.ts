import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord } from '../const'

export const updateOK = http.put(
  `${baseURL}/${dnsRecord.name}/${dnsRecord.type.toUpperCase()}`,
  async ({ request }) => {
    // Construct a URL instance out of the intercepted request.
    const body = await request.json()
    if (
      typeof body === 'object' &&
      body &&
      body.name === dnsRecord.name &&
      body.id === dnsRecord.id &&
      body.type === dnsRecord.type &&
      body.ttl === dnsRecord.ttl &&
      body.resource_records &&
      Array.isArray(body.resource_records) &&
      body.resource_records.length === dnsRecord.resource_records.length &&
      body.resource_records[0].content[0] ===
        dnsRecord.resource_records[0].content[0] &&
      body.resource_records[0].enabled
    ) {
      return HttpResponse.json(body, { status: 200 })
    }
    return HttpResponse.json({ error: 'bad request' }, { status: 400 })
  }
)
