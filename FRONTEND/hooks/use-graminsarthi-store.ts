import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Financials, ShopProfileKey } from '@/lib/graminsarthi/data'
import { getShopProfile } from '@/lib/graminsarthi/data'
import type { Lang } from '@/lib/graminsarthi/i18n'
import { apiRequest } from '@/lib/api'

export type TransactionType = 'SALE' | 'PURCHASE' | 'EXPENSE' | 'OVERHEAD' | 'INCOME'

export type Transaction = {
  id: string
  type: string
  amount: number
  description: string
  date: string // YYYY-MM-DD
}

export type InventoryCategory = 'STAR' | 'UNDERPERFORMING' | 'REGULAR'

export type InventoryItem = {
  id: string
  name: string
  category: InventoryCategory
}

export type Business = {
  id: string
  merchantId: string
  businessName: string
  businessCategory: string
  village?: string
  district?: string
  state?: string
  location?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type FinancialCalculation = {
  grossSales: number
  purchaseCosts: number
  totalExpenses: number
  grossProfit: number
  netProfit: number
  operatingMargin: number
  ledgerEntryCount: number
}

export function useGraminsarthiStore(initialShop: ShopProfileKey, lang: Lang, merchantId?: string) {
  const [shopKey, setShopKey] = useState<ShopProfileKey>(initialShop)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])

  const [monthlyInvestment, setMonthlyInvestment] = useState(0)
  const [tradeCategory, setTradeCategory] = useState('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [backendFinancials, setBackendFinancials] = useState<FinancialCalculation | null>(null)
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Resolve merchantId from argument or client storage
  const activeMerchantId = useMemo(() => {
    if (merchantId) return merchantId
    if (typeof window !== 'undefined') {
      return localStorage.getItem('graminsarthi.merchantId') || sessionStorage.getItem('graminsarthi.merchantId') || undefined
    }
    return undefined
  }, [merchantId])

  // Fetch businesses for a given merchant
  const fetchBusinesses = useCallback(async (mId: string): Promise<Business[]> => {
    const res = await apiRequest<{ success: boolean; data: Business[] }>(
      `/api/business?merchantId=${encodeURIComponent(mId)}`
    )
    return res.data || []
  }, [])

  // Fetch ledger entries and calculate financials for business
  const fetchLedgerAndCalculation = useCallback(async (mId: string, bId: string) => {
    const [ledgerRes, calcRes] = await Promise.all([
      apiRequest<{ success: boolean; data: Array<{ id: string; entryType: string; amount: number; description?: string; entryDate: string }> }>(
        `/api/ledger?businessId=${encodeURIComponent(bId)}&merchantId=${encodeURIComponent(mId)}`
      ),
      apiRequest<{ success: boolean; data: FinancialCalculation }>('/api/ledger/calculate', {
        method: 'POST',
        body: JSON.stringify({ merchantId: mId, businessId: bId }),
      }),
    ])
    return {
      entries: ledgerRes.data || [],
      calculation: calcRes.data,
    }
  }, [])

  // Initial load effect
  useEffect(() => {
    const profile = getShopProfile(shopKey, lang)
    setTradeCategory(profile.tradeCategory)
    setMonthlyInvestment(profile.monthlyInvestment)
    setInventoryItems([
      ...profile.underperformingItems.map((name, i) => ({ id: `u-${i}`, name, category: 'UNDERPERFORMING' as const })),
      { id: 's-1', name: profile.starProduct, category: 'STAR' as const }
    ])

    if (!activeMerchantId) {
      setBusinesses([])
      setTransactions([
        { id: 'init-sale', type: 'SALE', amount: profile.dailySales, description: 'Daily Sales', date: new Date().toISOString().slice(0, 10) },
        { id: 'init-exp', type: 'PURCHASE', amount: profile.dailyExpenses, description: 'Daily Expenses', date: new Date().toISOString().slice(0, 10) },
      ])
      setBusinessId(null)
      setBusinessName(profile.name)
      setCurrentBusiness(null)
      setBackendFinancials(null)
      return
    }

    let isMounted = true
    setIsLoading(true)

    async function loadData() {
      try {
        setApiError('')
        let businessList = await fetchBusinesses(activeMerchantId!)
        if (!isMounted) return

        if (businessList.length === 0) {
          // Auto-create initial business for this merchant matching the profile
          try {
            const newBiz = await apiRequest<{ success: boolean; data: Business }>('/api/business', {
              method: 'POST',
              body: JSON.stringify({
                merchantId: activeMerchantId,
                businessName: profile.name,
                businessCategory: profile.tradeCategory,
              }),
            })
            businessList = [newBiz.data]
          } catch {
            // ignore
          }
        }

        setBusinesses(businessList)

        if (businessList.length === 0) {
          setBusinessId(null)
          setBusinessName(profile.name)
          setCurrentBusiness(null)
          setTransactions([])
          setBackendFinancials(null)
          setIsLoading(false)
          return
        }

        const savedBusinessId = typeof window !== 'undefined'
          ? (localStorage.getItem('graminsarthi.businessId') || sessionStorage.getItem('graminsarthi.businessId'))
          : null

        const activeBiz = businessList.find(b => b.id === savedBusinessId) || businessList[0]
        setBusinessId(activeBiz.id)
        setBusinessName(activeBiz.businessName)
        setTradeCategory(activeBiz.businessCategory)
        setCurrentBusiness(activeBiz)

        if (typeof window !== 'undefined') {
          localStorage.setItem('graminsarthi.businessId', activeBiz.id)
          sessionStorage.setItem('graminsarthi.businessId', activeBiz.id)
        }

        let { entries, calculation } = await fetchLedgerAndCalculation(activeMerchantId!, activeBiz.id)
        if (!isMounted) return

        if (entries.length === 0) {
          const today = new Date().toISOString().slice(0, 10)
          try {
            await apiRequest('/api/ledger', {
              method: 'POST',
              body: JSON.stringify({
                merchantId: activeMerchantId,
                businessId: activeBiz.id,
                entryType: 'SALE',
                amount: profile.dailySales,
                description: 'Daily Sales',
                entryDate: today,
              }),
            })
            await apiRequest('/api/ledger', {
              method: 'POST',
              body: JSON.stringify({
                merchantId: activeMerchantId,
                businessId: activeBiz.id,
                entryType: 'PURCHASE',
                amount: profile.dailyExpenses,
                description: 'Daily Stock & Supplies',
                entryDate: today,
              }),
            })
            const refreshed = await fetchLedgerAndCalculation(activeMerchantId!, activeBiz.id)
            entries = refreshed.entries
            calculation = refreshed.calculation
          } catch {
            // fallback gracefully
          }
        }

        setTransactions(entries.map(e => ({
          id: e.id,
          type: e.entryType,
          amount: Number(e.amount),
          description: e.description || e.entryType,
          date: e.entryDate,
        })))
        setBackendFinancials(calculation)
      } catch (err) {
        if (isMounted) {
          setApiError(err instanceof Error ? err.message : 'Unable to connect to backend.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [shopKey, lang, activeMerchantId, fetchBusinesses, fetchLedgerAndCalculation])

  // Select a business by ID
  const selectBusiness = useCallback(async (bId: string) => {
    if (!activeMerchantId) return
    const target = businesses.find(b => b.id === bId)
    if (!target) return

    setBusinessId(target.id)
    setBusinessName(target.businessName)
    setTradeCategory(target.businessCategory)
    setCurrentBusiness(target)

    if (typeof window !== 'undefined') {
      localStorage.setItem('graminsarthi.businessId', target.id)
      sessionStorage.setItem('graminsarthi.businessId', target.id)
    }

    try {
      setApiError('')
      const { entries, calculation } = await fetchLedgerAndCalculation(activeMerchantId, target.id)
      setTransactions(entries.map(e => ({
        id: e.id,
        type: e.entryType,
        amount: Number(e.amount),
        description: e.description || e.entryType,
        date: e.entryDate,
      })))
      setBackendFinancials(calculation)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load business data')
    }
  }, [activeMerchantId, businesses, fetchLedgerAndCalculation])

  // Create a new business
  const createBusiness = useCallback(async (input: {
    businessName: string
    businessCategory: string
    village?: string
    district?: string
    state?: string
    location?: string
    description?: string
  }): Promise<Business | null> => {
    if (!activeMerchantId) {
      setApiError('Merchant ID is missing')
      return null
    }
    try {
      setApiError('')
      const res = await apiRequest<{ success: boolean; data: Business }>('/api/business', {
        method: 'POST',
        body: JSON.stringify({
          merchantId: activeMerchantId,
          businessName: input.businessName.trim(),
          businessCategory: input.businessCategory.trim(),
          village: input.village?.trim() || undefined,
          district: input.district?.trim() || undefined,
          state: input.state?.trim() || undefined,
          location: input.location?.trim() || undefined,
          description: input.description?.trim() || undefined,
        }),
      })
      const created = res.data
      setBusinesses(prev => [...prev, created])
      await selectBusiness(created.id)
      return created
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create business')
      return null
    }
  }, [activeMerchantId, selectBusiness])

  // Update business
  const updateBusiness = useCallback(async (bId: string, input: Partial<{
    businessName: string
    businessCategory: string
    village?: string
    district?: string
    state?: string
    location?: string
    description?: string
  }>): Promise<Business | null> => {
    if (!activeMerchantId) return null
    try {
      setApiError('')
      const res = await apiRequest<{ success: boolean; data: Business }>(`/api/business/${bId}`, {
        method: 'PUT',
        body: JSON.stringify({
          merchantId: activeMerchantId,
          ...input,
        }),
      })
      const updated = res.data
      setBusinesses(prev => prev.map(b => b.id === bId ? updated : b))
      if (businessId === bId) {
        setBusinessName(updated.businessName)
        setTradeCategory(updated.businessCategory)
        setCurrentBusiness(updated)
      }
      return updated
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to update business')
      return null
    }
  }, [activeMerchantId, businessId])

  // Delete business
  const deleteBusiness = useCallback(async (bId: string): Promise<boolean> => {
    if (!activeMerchantId) return false
    try {
      setApiError('')
      await apiRequest<{ success: boolean; data: Business }>(
        `/api/business/${bId}?merchantId=${encodeURIComponent(activeMerchantId)}`,
        { method: 'DELETE' }
      )
      const remaining = businesses.filter(b => b.id !== bId)
      setBusinesses(remaining)
      if (businessId === bId) {
        if (remaining.length > 0) {
          await selectBusiness(remaining[0].id)
        } else {
          setBusinessId(null)
          setBusinessName('')
          setCurrentBusiness(null)
          setTransactions([])
          setBackendFinancials(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('graminsarthi.businessId')
            sessionStorage.removeItem('graminsarthi.businessId')
          }
        }
      }
      return true
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to delete business')
      return false
    }
  }, [activeMerchantId, businesses, businessId, selectBusiness])

  // Real backend financials
  const financials = useMemo<Financials>(() => {
    if (backendFinancials) {
      return {
        dailySales: backendFinancials.grossSales,
        dailyExpenses: (backendFinancials.purchaseCosts ?? 0) + (backendFinancials.totalExpenses ?? 0),
        monthlyInvestment,
        grossSales: backendFinancials.grossSales,
        purchaseCosts: backendFinancials.purchaseCosts,
        totalExpenses: backendFinancials.totalExpenses,
        grossProfit: backendFinancials.grossProfit,
        netProfit: backendFinancials.netProfit,
        operatingMargin: backendFinancials.operatingMargin,
        ledgerEntryCount: backendFinancials.ledgerEntryCount,
      }
    }
    const sales = transactions.filter(t => t.type === 'SALE' || t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const purchases = transactions.filter(t => t.type === 'PURCHASE' || t.type === 'STOCK_COST').reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter(t => ['EXPENSE', 'RENT', 'POWER', 'LABOR', 'INTEREST', 'TRANSPORT', 'OTHER_EXPENSE', 'OVERHEAD'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0)
    const grossProfit = sales - purchases
    const netProfit = grossProfit - expenses
    const operatingMargin = sales > 0 ? (netProfit / sales) * 100 : 0

    return {
      dailySales: sales,
      dailyExpenses: purchases + expenses,
      monthlyInvestment,
      grossSales: sales,
      purchaseCosts: purchases,
      totalExpenses: expenses,
      grossProfit,
      netProfit,
      operatingMargin,
      ledgerEntryCount: transactions.length,
    }
  }, [backendFinancials, transactions, monthlyInvestment])

  const switchShop = (key: ShopProfileKey) => {
    setShopKey(key)
  }

  // Add ledger entry
  const addTransaction = useCallback(async (t: {
    type: string
    amount: number
    description: string
    date?: string
  }) => {
    if (!activeMerchantId || !businessId) {
      setApiError('Select a business before adding a ledger entry.')
      return
    }

    let entryType = t.type.trim().toUpperCase()
    if (entryType === 'INCOME') entryType = 'SALE'

    const entryDate = t.date || new Date().toISOString().slice(0, 10)

    try {
      setApiError('')
      await apiRequest<{ success: boolean; data: { id: string } }>('/api/ledger', {
        method: 'POST',
        body: JSON.stringify({
          merchantId: activeMerchantId,
          businessId,
          entryType,
          amount: Number(t.amount),
          description: t.description.trim() || entryType,
          entryDate,
        }),
      })

      const { entries, calculation } = await fetchLedgerAndCalculation(activeMerchantId, businessId)
      setTransactions(entries.map(e => ({
        id: e.id,
        type: e.entryType,
        amount: Number(e.amount),
        description: e.description || e.entryType,
        date: e.entryDate,
      })))
      setBackendFinancials(calculation)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to save ledger entry.')
    }
  }, [activeMerchantId, businessId, fetchLedgerAndCalculation])

  // Update ledger entry
  const updateTransaction = useCallback(async (id: string, updates: Partial<{
    type: string
    amount: number
    description: string
    date?: string
  }>) => {
    if (!activeMerchantId || !businessId) return

    let entryType = updates.type ? updates.type.trim().toUpperCase() : undefined
    if (entryType === 'INCOME') entryType = 'SALE'

    try {
      setApiError('')
      await apiRequest(`/api/ledger/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          merchantId: activeMerchantId,
          entryType,
          amount: updates.amount !== undefined ? Number(updates.amount) : undefined,
          description: updates.description !== undefined ? updates.description.trim() : undefined,
          entryDate: updates.date,
        }),
      })

      const { entries, calculation } = await fetchLedgerAndCalculation(activeMerchantId, businessId)
      setTransactions(entries.map(e => ({
        id: e.id,
        type: e.entryType,
        amount: Number(e.amount),
        description: e.description || e.entryType,
        date: e.entryDate,
      })))
      setBackendFinancials(calculation)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to update ledger entry.')
    }
  }, [activeMerchantId, businessId, fetchLedgerAndCalculation])

  // Delete ledger entry
  const removeTransaction = useCallback(async (id: string) => {
    if (!activeMerchantId || !businessId) return
    try {
      setApiError('')
      await apiRequest(
        `/api/ledger/${id}?merchantId=${encodeURIComponent(activeMerchantId)}`,
        { method: 'DELETE' }
      )

      const { entries, calculation } = await fetchLedgerAndCalculation(activeMerchantId, businessId)
      setTransactions(entries.map(e => ({
        id: e.id,
        type: e.entryType,
        amount: Number(e.amount),
        description: e.description || e.entryType,
        date: e.entryDate,
      })))
      setBackendFinancials(calculation)
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to delete ledger entry.')
    }
  }, [activeMerchantId, businessId, fetchLedgerAndCalculation])

  const addInventoryItem = (i: Omit<InventoryItem, 'id'>) => {
    setInventoryItems(prev => [...prev, { ...i, id: Date.now().toString() }])
  }

  const updateInventoryItem = (id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => {
    setInventoryItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const removeInventoryItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id))
  }

  return {
    shopKey,
    switchShop,
    tradeCategory,
    setTradeCategory,
    financials,
    setMonthlyInvestment,
    monthlyInvestment,
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    inventoryItems,
    businessId,
    businessName,
    businesses,
    currentBusiness,
    selectBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    apiError,
    isLoading,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  }
}
