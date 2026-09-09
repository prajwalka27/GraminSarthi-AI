'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Store,
  Users,
  ShoppingBag,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Sparkles,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  Search,
  Filter,
  BarChart3,
  Bot,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Check
} from 'lucide-react'
import { BrandMark } from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import {
  useVillageStore,
  type ShopCategory,
  type ProductItem,
  type VillageOrder,
  type CustomerProfile,
  type KhataEntry
} from '@/lib/graminsarthi/village-store'

type HostTab = 'OVERVIEW' | 'CATALOG' | 'ORDERS' | 'KHATA' | 'CUSTOMERS'

export function HostPortal({
  lang,
  onLangChange,
  onSwitchToCustomer,
  onSwitchToMerchant,
  onBack,
}: {
  lang: Lang
  onLangChange: (l: Lang) => void
  onSwitchToCustomer: () => void
  onSwitchToMerchant: () => void
  onBack: () => void
}) {
  const {
    products,
    addProduct,
    toggleProductAvailability,
    deleteProduct,
    customers,
    orders,
    updateOrderStatus,
    khataRecords,
    recordKhataRepayment,
    addKhataCredit,
    shops
  } = useVillageStore()

  const [activeTab, setActiveTab] = useState<HostTab>('OVERVIEW')
  const [searchQuery, setSearchQuery] = useState('')

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodCat, setProdCat] = useState<ShopCategory>('kirana')
  const [prodPrice, setProdPrice] = useState('')
  const [prodUnit, setProdUnit] = useState('1 kg')
  const [prodShop, setProdShop] = useState('Sri Lakshmi Provisions')
  const [prodTag, setProdTag] = useState('Fresh Stock')

  // Khata Adjustment Modal State
  const [selectedKhata, setSelectedKhata] = useState<KhataEntry | null>(null)
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'PAYMENT'>('PAYMENT')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustNote, setAdjustNote] = useState('')

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  const filteredOrders = useMemo(() => {
    return orders.filter(o =>
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerMobile.includes(searchQuery) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [orders, searchQuery])

  const filteredKhata = useMemo(() => {
    return khataRecords.filter(k =>
      k.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.customerMobile.includes(searchQuery) ||
      k.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [khataRecords, searchQuery])

  // Overview metrics
  const totalOrdersValue = useMemo(() => orders.reduce((acc, o) => acc + o.totalAmount, 0), [orders])
  const totalKhataOutstanding = useMemo(() => khataRecords.reduce((acc, k) => acc + k.totalDue, 0), [khataRecords])
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === 'pending').length, [orders])

  // Handle Add Product submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName.trim() || !prodPrice) return

    addProduct({
      name: prodName.trim(),
      category: prodCat,
      price: parseFloat(prodPrice),
      unit: prodUnit.trim(),
      shopName: prodShop,
      shopMobile: '+919876543210',
      tag: prodTag.trim() || undefined
    })

    setProdName('')
    setProdPrice('')
    setProdTag('Fresh Stock')
    setShowAddProductModal(false)
  }

  // Handle Khata Credit / Payment submit
  const handleKhataAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKhata || !adjustAmount) return
    const amt = parseFloat(adjustAmount)
    if (isNaN(amt) || amt <= 0) return

    if (adjustType === 'PAYMENT') {
      recordKhataRepayment(selectedKhata.id, amt)
    } else {
      addKhataCredit(selectedKhata.id, amt, adjustNote.trim() || 'Manual Credit Issued by Host')
    }

    setSelectedKhata(null)
    setAdjustAmount('')
    setAdjustNote('')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <BrandMark className="h-9 w-9 text-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">GraminSarthi</span>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  👑 Host & Village Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-purple-400" />
                <span>Full Village Control Center (Rampur Panchayat)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Jump to Customer Portal */}
            <button
              onClick={onSwitchToCustomer}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              title="Open Village Customer Market"
            >
              <span>🛒 View as Customer</span>
            </button>

            {/* 1-Click Jump to Merchant Portal */}
            <button
              onClick={onSwitchToMerchant}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
              title="Open Merchant Ledger & Feasibility AI"
            >
              <span>🏪 Merchant Tools</span>
            </button>

            <LanguageSelect lang={lang} onChange={onLangChange} compact />
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="border-t border-border/80 bg-secondary/40 px-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'OVERVIEW', label: 'Village Overview', icon: BarChart3 },
              { id: 'CATALOG', label: `Market Catalog (${products.length})`, icon: Store },
              { id: 'ORDERS', label: `Customer Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : null },
              { id: 'KHATA', label: `Village Khata (₹${totalKhataOutstanding})`, icon: Receipt },
              { id: 'CUSTOMERS', label: `Villagers (${customers.length})`, icon: Users },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as HostTab)
                    setSearchQuery('')
                  }}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-[11px] font-medium text-muted-foreground">Total Village Orders</span>
                <p className="mt-1 text-2xl font-bold text-foreground">₹{totalOrdersValue}</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{orders.length} orders logged</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <span className="text-[11px] font-medium text-amber-300">Total Khata (उधार) Due</span>
                <p className="mt-1 text-2xl font-bold text-amber-400">₹{totalKhataOutstanding}</p>
                <div className="mt-2 text-[11px] text-amber-200/80">
                  Across {khataRecords.length} village accounts
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-[11px] font-medium text-muted-foreground">Registered Villagers</span>
                <p className="mt-1 text-2xl font-bold text-foreground">{customers.length}</p>
                <div className="mt-2 text-[11px] text-emerald-400">
                  Active village profiles
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-[11px] font-medium text-muted-foreground">Marketplace Items</span>
                <p className="mt-1 text-2xl font-bold text-foreground">{products.length}</p>
                <div className="mt-2 text-[11px] text-purple-400">
                  {products.filter(p => p.available).length} in stock
                </div>
              </div>
            </div>

            {/* Quick Actions & AI Advisor Insight */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* AI Village Health Insight */}
              <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-card to-background p-6 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">AI Village FinTech Health Summary</h3>
                </div>

                <div className="mt-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    • <strong>Khata Repayment Rate: 88.4%</strong> — Villagers in Rampur are consistently settling credit via UPI after weekly harvest sales. This qualifies 3 local kirana shops for Mudra Shishu/Kishore credit line enhancements.
                  </p>
                  <p>
                    • <strong>High Velocity Demand:</strong> Fresh Buffalo Milk and Sharbati Atta represent 62% of daily morning volume. Consider setting auto-replenishment alerts for Gopal Dairy Point and Sri Lakshmi Provisions.
                  </p>
                  <p>
                    • <strong>Micro-Credit Health:</strong> Current total outstanding credit (₹{totalKhataOutstanding}) is well below the safe village threshold of ₹25,000. Low default risk observed.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5 pt-4 border-t border-border/60">
                  <button
                    onClick={() => setActiveTab('ORDERS')}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition"
                  >
                    View All {orders.length} Orders →
                  </button>
                  <button
                    onClick={() => setActiveTab('KHATA')}
                    className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition"
                  >
                    Manage Khata Accounts →
                  </button>
                  <button
                    onClick={onSwitchToMerchant}
                    className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
                  >
                    Open AI What-If Simulator →
                  </button>
                </div>
              </div>

              {/* Verified Shops in Village */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-sm font-bold text-foreground">Panchayat Shops Directory</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{shops.length} verified merchant booths</p>

                <div className="mt-4 space-y-3">
                  {shops.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.owner} • {s.categoryLabel}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {s.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATALOG MANAGEMENT */}
        {activeTab === 'CATALOG' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Village Market Catalog Manager</h2>
                <p className="text-xs text-muted-foreground">Add products, update fair prices, or toggle availability</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-border bg-card px-3 py-1.5 text-xs">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground/60 w-36 sm:w-48"
                  />
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-purple-500 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Product</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-secondary/60 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product Name</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price / Unit</th>
                      <th className="px-4 py-3 font-semibold">Fulfilling Shop</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/30 transition">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {p.name}
                          {p.tag && (
                            <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {p.tag}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 uppercase text-[11px] text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">₹{p.price} <span className="text-[10px] text-muted-foreground font-normal">/{p.unit}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{p.shopName}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleProductAvailability(p.id)}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition ${
                              p.available
                                ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                            }`}
                          >
                            {p.available ? '● Available' : '○ Out of Stock'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 transition"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS MANAGEMENT */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Customer Orders Manager</h2>
                <p className="text-xs text-muted-foreground">Track incoming village orders, dispatch items, and manage delivery status</p>
              </div>

              <div className="flex items-center rounded-xl border border-border bg-card px-3 py-1.5 text-xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customer, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground/60 w-36 sm:w-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto h-10 w-10 opacity-30" />
                  <p className="mt-2 text-xs">No orders matching search query.</p>
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div key={ord.id} className="rounded-2xl border border-border bg-card p-4 transition hover:border-purple-500/30">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">#{ord.id}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          ord.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                          ord.status === 'confirmed' ? 'bg-sky-500/20 text-sky-300' :
                          ord.status === 'out_for_delivery' ? 'bg-purple-500/20 text-purple-300' :
                          ord.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{ord.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400">Total: ₹{ord.totalAmount}</span>
                        <span className="rounded bg-secondary px-2 py-0.5 text-[10px] uppercase font-semibold text-muted-foreground">
                          {ord.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-foreground">{ord.customerName} ({ord.customerMobile})</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-purple-400" />
                          <span>{ord.deliveryAddress}</span>
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ord.items.map((i, idx) => (
                            <span key={idx} className="rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-foreground">
                              {i.name} ({i.qty} x {i.unit})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Status advancement buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'confirmed')}
                            className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                          >
                            ✓ Confirm Order
                          </button>
                        )}
                        {ord.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                            className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
                          >
                            🚚 Out for Delivery
                          </button>
                        )}
                        {ord.status === 'out_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'delivered')}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            ✓ Mark Delivered
                          </button>
                        )}
                        {ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                            className="rounded-xl border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-rose-400"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: KHATA (उधार) LEDGER MANAGEMENT */}
        {activeTab === 'KHATA' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Village Khata (उधार) Management</h2>
                <p className="text-xs text-muted-foreground">Administer rural credit limits, issue store credit, and record repayments</p>
              </div>

              <div className="flex items-center rounded-xl border border-border bg-card px-3 py-1.5 text-xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search villager or shop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground/60 w-36 sm:w-48"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredKhata.map((k) => (
                <div key={k.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">{k.customerName}</h3>
                      <p className="text-xs text-muted-foreground">{k.customerMobile}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Limit: ₹{k.creditLimit}
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/80 bg-secondary/50 p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-muted-foreground">Outstanding Due:</span>
                      <span className={`text-lg font-bold ${k.totalDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ₹{k.totalDue}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground truncate">Shop: {k.shopName}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">Recent: {k.itemsSummary}</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedKhata(k)
                        setAdjustType('PAYMENT')
                        setAdjustAmount(k.totalDue > 0 ? k.totalDue.toString() : '')
                      }}
                      className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                    >
                      Record Payment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedKhata(k)
                        setAdjustType('CREDIT')
                        setAdjustAmount('')
                      }}
                      className="flex-1 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                    >
                      + Issue Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: VILLAGERS REGISTRY */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Registered Villagers Directory</h2>
                <p className="text-xs text-muted-foreground">All customer profiles created via self-onboarding or merchant registry</p>
              </div>

              <div className="flex items-center rounded-xl border border-border bg-card px-3 py-1.5 text-xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search villager name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground/60 w-36 sm:w-48"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-secondary/60 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Villager Name</th>
                      <th className="px-4 py-3 font-semibold">Mobile Number</th>
                      <th className="px-4 py-3 font-semibold">Village Ward / Street</th>
                      <th className="px-4 py-3 font-semibold">House No</th>
                      <th className="px-4 py-3 font-semibold">Approved Credit Limit</th>
                      <th className="px-4 py-3 font-semibold">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/30 transition">
                        <td className="px-4 py-3 font-bold text-foreground">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.mobile}</td>
                        <td className="px-4 py-3 text-foreground">{c.ward}, {c.village}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.houseNo || 'N/A'}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-400">₹{c.creditLimit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Add Product to Village Market</h3>
                  <p className="text-xs text-muted-foreground">Will appear immediately in customer catalog</p>
                </div>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Honey, Fresh Butter, Basmati Rice"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Category *</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value as ShopCategory)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                  >
                    <option value="kirana">Kirana & Grocery</option>
                    <option value="dairy">Milk & Dairy</option>
                    <option value="farm">Farm Produce & Seeds</option>
                    <option value="tea">Tea & Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 85"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 kg, 500ml, piece"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh, Best Seller"
                    value={prodTag}
                    onChange={(e) => setProdTag(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Fulfilling Village Shop</label>
                <select
                  value={prodShop}
                  onChange={(e) => setProdShop(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.owner})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 shadow-md transition"
              >
                Add Product to Village Market
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Khata Credit / Payment Modal */}
      {selectedKhata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {adjustType === 'PAYMENT' ? 'Record Repayment' : 'Issue Khata Credit'}
              </h3>
              <button onClick={() => setSelectedKhata(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Customer: <strong className="text-foreground">{selectedKhata.customerName}</strong> ({selectedKhata.customerMobile})<br />
              Current Outstanding: <strong className="text-amber-400">₹{selectedKhata.totalDue}</strong>
            </div>

            <form onSubmit={handleKhataAdjustSubmit} className="mt-4 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('PAYMENT')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    adjustType === 'PAYMENT'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  Record Repayment (-)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    adjustType === 'CREDIT'
                      ? 'bg-amber-600 text-white'
                      : 'border border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  Issue Credit (+)
                </button>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 250"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Transaction Note</label>
                <input
                  type="text"
                  placeholder={adjustType === 'PAYMENT' ? 'Cash repayment or UPI confirmation' : 'Grain / provision purchase on credit'}
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className={`mt-2 w-full rounded-xl py-2.5 text-xs font-bold text-white transition ${
                  adjustType === 'PAYMENT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {adjustType === 'PAYMENT' ? 'Confirm Repayment' : 'Confirm Credit Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
