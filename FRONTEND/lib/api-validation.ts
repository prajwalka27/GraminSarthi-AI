export const ENTRY_TYPES = ['SALE', 'PURCHASE', 'STOCK_COST', 'OVERHEAD', 'EXPENSE'] as const
export type EntryType = (typeof ENTRY_TYPES)[number]

export function isPhone(value: unknown): value is string {
    return typeof value === 'string' && /^\+?[1-9]\d{7,14}$/.test(value)
}

export function isUuid(value: unknown): value is string {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function isDate(value: unknown): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}
