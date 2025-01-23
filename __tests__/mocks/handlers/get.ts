import { http, HttpResponse } from 'msw'

import { baseURL, dnsRecord } from '../const'

export const getFound = http.get(
  `${baseURL}/${dnsRecord.name}/${dnsRecord.type.toUpperCase()}`,
  () => HttpResponse.json(dnsRecord)
)

export const getNotFound = http.get(`${baseURL}/:recordId/:fieldType`, () =>
  HttpResponse.json(
    {
      error: 'record is not found'
    },
    { status: 404 }
  )
)
