export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
};

export type Merchant = {
    id: string;
    userId?: string | null;
    name: string;
    businessName: string;
    ownerName?: string;
    mobile: string;
    phone: string;
    email?: string;
    address?: string;
    category?: string;
    language: string;
    createdAt: string;
    updatedAt: string;
};

export type Business = {
    id: string;
    merchantId: string;
    businessName: string;
    category: string;
    businessCategory: string;
    village?: string;
    district?: string;
    state?: string;
    location?: string;
    description?: string;
    address?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
};

export type LedgerEntry = {
    id: string;
    merchantId: string;
    businessId: string;
    type: string;
    entryType: string;
    amount: number;
    description?: string;
    entryDate: string;
    createdAt: string;
    updatedAt: string;
};

export type DashboardStats = {
    businessCount: number;
    totalIncome: number;
    totalExpense: number;
    purchaseCosts: number;
    grossProfit: number;
    netProfit: number;
    operatingMargin: number;
    ledgerEntryCount: number;
};

export function mapUser(row: any): User {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || undefined,
        role: row.role || "user",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

export function mapMerchant(row: any): Merchant {
    const owner = row.owner_name || row.name || row.business_name || "";
    const bName = row.business_name || row.name || "Business";
    const phone = row.phone || row.mobile || "";

    return {
        id: row.id,
        userId: row.user_id || null,
        name: owner,
        ownerName: owner,
        businessName: bName,
        mobile: phone,
        phone: phone,
        email: row.email || undefined,
        address: row.address || undefined,
        category: row.category || undefined,
        language: row.language || "en",
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

export function mapBusiness(row: any): Business {
    const category = row.category || row.business_category || "General";
    return {
        id: row.id,
        merchantId: row.merchant_id,
        businessName: row.business_name,
        category: category,
        businessCategory: category,
        village: row.village || undefined,
        district: row.district || undefined,
        state: row.state || undefined,
        location: row.location || undefined,
        description: row.description || undefined,
        address: row.address || undefined,
        phone: row.phone || undefined,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

export function mapLedgerEntry(row: any): LedgerEntry {
    const type = (row.type || row.entry_type || "EXPENSE").toUpperCase();
    const dateStr = row.entry_date instanceof Date
        ? row.entry_date.toISOString().slice(0, 10)
        : String(row.entry_date || "").slice(0, 10) || new Date().toISOString().slice(0, 10);

    return {
        id: row.id,
        merchantId: row.merchant_id,
        businessId: row.business_id,
        type: type,
        entryType: type,
        amount: Number(row.amount) || 0,
        description: row.description || "",
        entryDate: dateStr,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

export type Problem = {
    id: string;
    merchantId?: string | null;
    businessId?: string | null;
    title: string;
    description?: string;
    category?: string;
    location?: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    updatedAt: string;
};

export function mapProblem(row: any): Problem {
    return {
        id: row.id,
        merchantId: row.merchant_id || null,
        businessId: row.business_id || null,
        title: row.title || "Untitled Issue",
        description: row.description || "",
        category: row.category || "General",
        location: row.location || "",
        priority: (row.priority || "medium").toLowerCase() as Problem["priority"],
        status: (row.status || "open").toLowerCase() as Problem["status"],
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
}

