import { randomUUID } from "node:crypto";

export type Merchant = {
    id: string;
    name: string;
    mobile: string;
    language: string;
    createdAt: string;
    updatedAt: string;
};

export type Business = {
    id: string;
    merchantId: string;
    businessName: string;
    businessCategory: string;
    village?: string;
    district?: string;
    state?: string;
    location?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
};

export type LedgerEntry = {
    id: string;
    merchantId: string;
    businessId: string;
    entryType: string;
    amount: number;
    description?: string;
    entryDate: string;
    createdAt: string;
    updatedAt: string;
};

export const merchants: Merchant[] = [];
export const businesses: Business[] = [];
export const ledgerEntries: LedgerEntry[] = [];

export function createId() {
    return randomUUID();
}

export function timestamp() {
    return new Date().toISOString();
}
