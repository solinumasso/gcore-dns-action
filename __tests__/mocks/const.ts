export const gcoreEndpoint = 'https://api.gcore.com/dns/v2/zones'
export const zone = 'soliguide.dev'
export const baseURL = `${gcoreEndpoint}/${zone}`

export const subdomain = 'ph'
export const dnsRecord = Object.freeze({
  id: 3089769,
  name: 'ph.soliguide.dev',
  type: 'CNAME',
  ttl: 600,
  meta: {},
  updated_at: 1737622929978597000,
  filter_set_id: null,
  pickers: null,
  resource_records: [
    {
      id: 101709299,
      content: ['domain.par.clever-cloud.com.'],
      enabled: true,
      meta: {}
    }
  ]
})
