import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord } from '../const'

export const deleteOK = http.delete(
  `${baseURL}/${dnsRecord.name}/${dnsRecord.type.toUpperCase()}`,
  () => HttpResponse.json({})
)
