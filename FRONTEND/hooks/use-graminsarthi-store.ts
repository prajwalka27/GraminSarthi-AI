import { useState, useMemo, useEffect } from 'react'
import type { Financials, ShopProfileKey } from '@/lib/graminsarthi/data'
import { getShopProfile } from '@/lib/graminsarthi/data'
import type { Lang } from '@/lib/graminsarthi/i18n'

export type TransactionType = 'INCOME' | 'EXPENSE'

export type Transaction = {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string // ISO string
}

export type InventoryCategory = 'STAR' | 'UNDERPERFORMING' | 'REGULAR'

export type InventoryItem = {
  id: string
  name: string
  category: InventoryCategory
}

export function useGraminsarthiStore(initialShop: ShopProfileKey, lang: Lang) {
  const [shopKey, setShopKey] = useState<ShopProfileKey>(initialShop)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  
  const [monthlyInvestment, setMonthlyInvestment] = useState(0)
  const [tradeCategory, setTradeCategory] = useState('')

  useEffect(() => {
    const profile = getShopProfile(shopKey, lang)
    setMonthlyInvestment(profile.monthlyInvestment)
    setTradeCategory(profile.tradeCategory)
    
    // Seed initial inventory from profile
    setInventoryItems([
      ...profile.underperformingItems.map((name, i) => ({ id: `u-${i}`, name, category: 'UNDERPERFORMING' as const })),
      { id: 's-1', name: profile.starProduct, category: 'STAR' as const }
    ])
    
    // Seed initial transactions from profile
    setTransactions([
      { id: 'init-inc', type: 'INCOME', amount: profile.dailySales, description: 'Daily Sales', date: new Date().toISOString() },
      { id: 'init-exp', type: 'EXPENSE', amount: profile.dailyExpenses, description: 'Daily Expenses', date: new Date().toISOString() }
    ])
  }, [shopKey, lang])

  const financials = useMemo<Financials>(() => {
    const dailySales = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    const dailyExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    
    return {
      dailySales,
      dailyExpenses,
      monthlyInvestment
    }
  }, [transactions, monthlyInvestment])

  const switchShop = (key: ShopProfileKey) => {
    setShopKey(key)
  }

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'>) => {
    setTransactions(prev => [...prev, { ...t, id: Date.now().toString(), date: new Date().toISOString() }])
  }
  
  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

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
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem
  }
}
