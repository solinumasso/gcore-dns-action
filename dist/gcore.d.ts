export declare const defaultFieldType = "CNAME";
export declare const defaultTTL = 600;
export type DNSFieldType = 'A' | 'AAAA' | 'NS' | 'CNAME' | 'MX' | 'TXT' | 'SRV' | 'CAA' | 'HTTPS' | 'SVCB';
export type GcoreMeta = Record<string, unknown>;
export interface DNSResourceRecord {
    id: number;
    content: string[];
    enabled: boolean;
    meta: GcoreMeta;
}
export interface DNSRecord {
    id: number;
    name: string;
    type: DNSFieldType;
    ttl: number;
    meta: GcoreMeta;
    updated_at: number;
    filter_set_id: unknown;
    pickers: unknown;
    resource_records: DNSResourceRecord[];
}
export interface GcoreError {
    error: string;
    exception?: 'validation_error';
    message?: 'validation error';
    validation?: unknown[];
}
export declare class GcoreClient {
    private readonly zone;
    private readonly client;
    private readonly basePath;
    constructor(apiKey: string, zone: string);
    private buildUrl;
    getSubdomainRecord(subdomain: string, fieldType: DNSFieldType): Promise<false | DNSRecord>;
    createSubdomainRecord(subdomain: string, target: string, fieldType: DNSFieldType, ttl?: number): Promise<DNSRecord>;
    updateSubdomainRecord(record: DNSRecord, target: string, ttl?: number): Promise<DNSRecord>;
    deleteSubdomainRecord(subdomain: string, fieldType: DNSFieldType): Promise<void>;
    upsertSubdomainRecord(subdomain: string, target: string, fieldType?: DNSFieldType, ttl?: number): Promise<DNSRecord>;
}
