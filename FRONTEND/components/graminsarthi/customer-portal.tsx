'use client'

import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Store,
  Milk,
  UtensilsCrossed,
  Wheat,
  MapPin,
  Phone,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  Check,
  Receipt,
  ExternalLink,
  Filter,
  UserPlus,
  User,
  Clock,
  Truck,
  ShieldCheck,
  PackageCheck,
  Mic,
} from 'lucide-react'
import { BrandMark } from './primitives'
import { LanguageSelect } from './language-select'
import { VoiceAssistant } from './voice-assistant'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'
import {
  useVillageStore,
  type ShopCategory,
  type ProductItem,
  type VillageShop,
  type CustomerProfile,
  type VillageOrder,
  type KhataEntry,
  type OrderItem
} from '@/lib/graminsarthi/village-store'

export interface CartItem {
  product: ProductItem
  qty: number
}

export function CustomerPortal({
  lang,
  onLangChange,
  onSwitchToMerchant,
  onBack,
}: {
  lang: Lang
  onLangChange: (l: Lang) => void
  onSwitchToMerchant: () => void
  onSwitchToHost?: () => void
  onBack: () => void
}) {
  const {
    products,
    shops,
    customers,
    currentCustomer,
    selectCustomer,
    registerCustomer,
    orders,
    placeOrder,
    khataRecords,
    recordKhataRepayment
  } = useVillageStore()

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showKhata, setShowKhata] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [paymentModalDue, setPaymentModalDue] = useState<KhataEntry | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orderSuccessNotice, setOrderSuccessNotice] = useState('')

  // New Customer Self-Registration Form State
  const [regName, setRegName] = useState('')
  const [regMobile, setRegMobile] = useState('')
  const [regVillage, setRegVillage] = useState('Rampur')
  const [regWard, setRegWard] = useState('Ward 4')
  const [regHouse, setRegHouse] = useState('')

  // Filter products from reactive store
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shopName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  // Customer's specific Khata records
  const myKhataRecords = useMemo(() => {
    if (!currentCustomer) return khataRecords
    return khataRecords.filter(k => k.customerId === currentCustomer.id || k.customerMobile === currentCustomer.mobile)
  }, [khataRecords, currentCustomer])

  const totalMyKhataDue = useMemo(() => {
    return myKhataRecords.reduce((acc, k) => acc + k.totalDue, 0)
  }, [myKhataRecords])

  // Customer's specific orders
  const myOrders = useMemo(() => {
    if (!currentCustomer) return orders
    return orders.filter(o => o.customerId === currentCustomer.id || o.customerMobile === currentCustomer.mobile)
  }, [orders, currentCustomer])

  // Cart calculations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.qty, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.qty, 0), [cart])

  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { product, qty: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const clearCart = () => setCart([])

  // Self-register customer submit
  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || regMobile.length < 10) return

    registerCustomer({
      name: regName.trim(),
      mobile: regMobile.trim(),
      village: regVillage.trim() || 'Rampur',
      ward: regWard.trim() || 'Ward 1',
      houseNo: regHouse.trim() || 'Main St'
    })

    setShowProfileModal(false)
    setRegName('')
    setRegMobile('')
    setRegHouse('')
  }

  // System Checkout (places order into reactive store so Host sees it!)
  const handleSystemCheckout = (paymentMethod: 'cod' | 'khata' | 'upi') => {
    if (cart.length === 0 || !currentCustomer) return

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      qty: item.qty,
      unit: item.product.unit,
      shopName: item.product.shopName
    }))

    const newOrder = placeOrder({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerMobile: currentCustomer.mobile,
      items: orderItems,
      totalAmount: cartTotal,
      paymentMethod,
      deliveryAddress: `${currentCustomer.ward}, ${currentCustomer.houseNo || ''}, ${currentCustomer.village}`
    })

    clearCart()
    setShowCart(false)
    setOrderSuccessNotice(`Order #${newOrder.id} successfully placed! The shopkeeper and village host have been notified.`)
    setTimeout(() => setOrderSuccessNotice(''), 5000)
  }

  // Generate WhatsApp ordering link
  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return
    const shop = cart[0].product.shopName
    const phone = cart[0].product.shopMobile.replace(/\D/g, '')
    const itemsList = cart
      .map((item) => `• ${item.product.name} (${item.qty} x ${item.product.unit}) = ₹${item.product.price * item.qty}`)
      .join('\n')

    const message = encodeURIComponent(
      `*New Order via GraminSarthi Village Customer App*\n\n` +
      `Hello ${shop},\n` +
      `Customer: ${currentCustomer?.name || 'Village Resident'} (${currentCustomer?.mobile || 'Village App'})\n` +
      `Address: ${currentCustomer?.ward || 'Ward 4'}, ${currentCustomer?.village || 'Rampur'}\n\n` +
      `*Ordered Items:*\n${itemsList}\n\n` +
      `*Total Bill: ₹${cartTotal}*\n` +
      `Payment: Village Khata / Cash on Delivery / UPI\n` +
      `Please confirm dispatch. Thank you!`
    )

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')

    // Also record in system orders
    if (currentCustomer) {
      handleSystemCheckout('cod')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  Customer Portal
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-emerald-400" />
                <span>{currentCustomer?.village || 'Rampur'}, {currentCustomer?.ward || 'Ward 4'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Customer Profile Badge / Self-Registration */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{currentCustomer ? currentCustomer.name : 'Create Profile'}</span>
              <span className="text-[10px] text-emerald-400/80">({currentCustomer?.ward || 'Register'})</span>
            </button>

            {/* Customer Voice Assistant Button */}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="relative inline-flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/15 px-3 py-2 text-xs font-semibold text-teal-200 transition hover:bg-teal-500/25 active:scale-95 shadow-sm"
              title="Ask Village Store Voice AI in Kannada, Hindi, English"
            >
              <Mic className="h-3.5 w-3.5 text-teal-300 animate-pulse" />
              <span className="hidden sm:inline">{lang === 'kn' ? 'ಧ್ವನಿ ಸಹಾಯಕ' : lang === 'hi' ? 'बोलकर पूछें' : 'Voice AI'}</span>
            </button>

            {/* My Orders Button */}
            <button
              onClick={() => setShowOrders(true)}
              className="relative hidden items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              <Truck className="h-3.5 w-3.5 text-sky-400" />
              <span>Orders</span>
              {myOrders.length > 0 && (
                <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] text-sky-300">
                  {myOrders.length}
                </span>
              )}
            </button>

            {/* Digital Khata button */}
            <button
              onClick={() => setShowKhata(true)}
              className="relative inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Khata (उधार)</span>
              <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] text-amber-200">
                ₹{totalMyKhataDue}
              </span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-500 hover:to-teal-500"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-emerald-800">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <LanguageSelect lang={lang} onChange={onLangChange} compact />

            {/* Switch to Merchant Mode */}
            <button
              onClick={onSwitchToMerchant}
              className="hidden rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-sky-500/50 hover:text-sky-300 lg:inline-flex"
            >
              🏪 Merchant Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Order Placement Success Notification Banner */}
        {orderSuccessNotice && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-300 shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-xs font-medium sm:text-sm">{orderSuccessNotice}</p>
            </div>
            <button onClick={() => setOrderSuccessNotice('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Hero / Banner for Customer */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-card to-background p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Village Super-Market & Digital Khata</span>
              </div>
              {currentCustomer && (
                <span className="rounded-full bg-secondary border border-border px-3 py-1 text-xs text-foreground/90">
                  Welcome, <strong>{currentCustomer.name}</strong>
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Local Village Goods, Fair Prices & Direct Orders
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Order fresh milk, groceries, farming seeds, and daily staples from verified local shops in your village with doorstep delivery or pickup.
            </p>

            {/* Search Bar */}
            <div className="mt-5 flex max-w-lg items-center rounded-2xl border border-border bg-card/90 px-3.5 py-2 shadow-inner focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search atta, milk, ghee, seeds, dal or shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2.5 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: 'all', label: 'All Items (सब सामान)', icon: Store },
            { key: 'kirana', label: 'Kirana & Grocery (किराना)', icon: Store },
            { key: 'dairy', label: 'Milk & Dairy (दूध व घी)', icon: Milk },
            { key: 'farm', label: 'Farm Produce & Seeds (खेती)', icon: Wheat },
            { key: 'tea', label: 'Tea & Snacks (चाय-नाश्ता)', icon: UtensilsCrossed },
          ].map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key as ShopCategory)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${isActive
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Village Shops Horizontal Scroll */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Verified Village Merchants</h2>
              <p className="text-xs text-muted-foreground">Nearby shops ready for immediate order & delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="group relative rounded-2xl border border-border bg-card p-4 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                    {shop.category === 'dairy' ? (
                      <Milk className="h-5 w-5 text-cyan-400" />
                    ) : shop.category === 'farm' ? (
                      <Wheat className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Store className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                    ★ {shop.rating}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-emerald-300 transition">
                  {shop.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Owner: {shop.owner} • {shop.categoryLabel}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    {shop.distance}
                  </span>
                  {shop.khataEnabled && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                      Khata Accepted
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${shop.mobile}`}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-secondary py-2 text-xs font-semibold text-foreground transition hover:border-emerald-500/40"
                  >
                    <Phone className="h-3 w-3 text-emerald-400" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${shop.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20want%20to%20order%20groceries.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-600/20 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-600/30"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Available Products & Daily Staples</h2>
              <p className="text-xs text-muted-foreground">Order online or add to your village shop khata</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Showing {filteredProducts.length} items
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProducts.map((p) => {
              const inCart = cart.find((item) => item.product.id === p.id)
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-3.5 transition hover:border-emerald-500/30"
                >
                  <div>
                    <div
                      className={`relative flex h-24 w-full items-center justify-center rounded-xl bg-gradient-to-br ${p.imageBg} border border-border/50`}
                    >
                      {p.category === 'dairy' ? (
                        <Milk className="h-10 w-10 text-cyan-300 opacity-80" />
                      ) : p.category === 'farm' ? (
                        <Wheat className="h-10 w-10 text-amber-300 opacity-80" />
                      ) : (
                        <Store className="h-10 w-10 text-emerald-300 opacity-80" />
                      )}
                      {p.tag && (
                        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                          {p.tag}
                        </span>
                      )}
                      {!p.available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl">
                          <span className="text-[11px] font-bold text-rose-300">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <h3 className="mt-2.5 line-clamp-2 text-xs font-semibold text-foreground sm:text-sm">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{p.shopName}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-bold text-emerald-400">₹{p.price}</span>
                      <span className="text-[11px] text-muted-foreground">/{p.unit}</span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2 py-1">
                        <button
                          onClick={() => updateQty(p.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-foreground hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold text-emerald-300">{inCart.qty}</span>
                        <button
                          onClick={() => updateQty(p.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-card text-foreground hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        disabled={!p.available}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-card p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-foreground">Order Cart</h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {cartCount}
                  </span>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Your cart is empty</p>
                  <p className="text-xs text-muted-foreground/60">Add groceries or staples from local village shops</p>
                </div>
              ) : (
                <div className="mt-4 max-h-[48vh] space-y-3 overflow-y-auto pr-1">
                  {cart.map(({ product, qty }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-foreground">{product.name}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          ₹{product.price} / {product.unit} • {product.shopName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1">
                          <button onClick={() => updateQty(product.id, -1)} className="text-muted-foreground hover:text-foreground">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-1 text-xs font-bold text-foreground">{qty}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="text-muted-foreground hover:text-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="w-14 text-right text-xs font-bold text-emerald-400">
                          ₹{product.price * qty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Total</span>
                  <span className="text-lg font-bold text-emerald-400">₹{cartTotal}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Order as: <strong>{currentCustomer?.name}</strong> ({currentCustomer?.ward}, {currentCustomer?.village})
                </p>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleSystemCheckout('khata')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600/90 py-3 text-xs font-bold text-white shadow-md transition hover:bg-amber-600"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Charge to Village Khata (उधार में जोड़ें)</span>
                  </button>

                  <button
                    onClick={() => handleSystemCheckout('cod')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
                  >
                    <Truck className="h-4 w-4" />
                    <span>Order for Doorstep Delivery (Cash / UPI on Delivery)</span>
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Order via WhatsApp</span>
                  </button>

                  <button
                    onClick={clearCart}
                    className="inline-flex w-full items-center justify-center py-1.5 text-xs font-medium text-muted-foreground hover:text-rose-400"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Self-Registration / Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Customer Profile & Self-Registration</h3>
                  <p className="text-xs text-muted-foreground">अपना खाता बनाएं या प्रोफाइल बदलें</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Switch Existing Villager Profile
              </span>
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      selectCustomer(c)
                      setShowProfileModal(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border p-2.5 text-left text-xs transition ${currentCustomer?.id === c.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                      : 'border-border bg-secondary text-foreground hover:border-emerald-500/30'
                      }`}
                  >
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.ward}, {c.village} • {c.mobile}</p>
                    </div>
                    {currentCustomer?.id === c.id && (
                      <Check className="h-4 w-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegisterCustomer} className="mt-5 border-t border-border pt-4 space-y-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                + Register New Customer (नया ग्राहक जोड़ें)
              </span>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Full Name (पूरा नाम) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sita Devi, Balwan Singh"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit mobile"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Village Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rampur"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Ward / Street</label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 3, Mandi Marg"
                    value={regWard}
                    onChange={(e) => setRegWard(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">House / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. H-42, Near Temple"
                    value={regHouse}
                    onChange={(e) => setRegHouse(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              >
                Create My Customer Account (रजिस्टर करें)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Drawer / Modal */}
      {showOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">My Orders (मेरे ऑर्डर)</h3>
                  <p className="text-xs text-muted-foreground">Track pending & delivered orders</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrders(false)}
                className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {myOrders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <PackageCheck className="mx-auto h-10 w-10 opacity-30" />
                  <p className="mt-2 text-xs">No orders placed yet.</p>
                </div>
              ) : (
                myOrders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-border bg-secondary p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-foreground">#{o.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                        o.status === 'confirmed' ? 'bg-sky-500/20 text-sky-300' :
                          o.status === 'out_for_delivery' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-amber-500/20 text-amber-300'
                        }`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-foreground">
                      {o.items.map(i => `${i.name} (${i.qty}x)`).join(', ')}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                      <span>Method: <strong className="uppercase text-foreground">{o.paymentMethod}</strong></span>
                      <span>Total: <strong className="text-emerald-400 font-bold text-xs">₹{o.totalAmount}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Digital Khata Modal */}
      {showKhata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">My Village Khata (डिजिटल खाता)</h3>
                  <p className="text-xs text-muted-foreground">Customer: {currentCustomer?.name} ({currentCustomer?.ward})</p>
                </div>
              </div>
              <button
                onClick={() => setShowKhata(false)}
                className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {myKhataRecords.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Receipt className="mx-auto h-10 w-10 opacity-30" />
                  <p className="mt-2 text-xs">No active Khata credit due with village merchants!</p>
                </div>
              ) : (
                myKhataRecords.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-secondary p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">{k.shopName}</h4>
                      <p className="text-xs text-muted-foreground">Shopkeeper: {k.shopOwner} ({k.shopMobile})</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Last bill: {k.itemsSummary}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Amount</span>
                        <p className="text-base font-bold text-amber-400">₹{k.totalDue}</p>
                      </div>
                      {k.totalDue > 0 && (
                        <button
                          onClick={() => setPaymentModalDue(k)}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                        >
                          Pay via UPI
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              💡 <strong>Smart Khata Benefit:</strong> Timely repayment of village shop credit builds a verified rural credit record for PMMY Mudra & Kisan Credit Card eligibility!
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Payment Modal */}
      {paymentModalDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-emerald-400">GraminSarthi UPI Instant Khata</span>
              <button onClick={() => setPaymentModalDue(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-foreground">Pay {paymentModalDue.shopName}</h3>
            <p className="text-2xl font-black text-emerald-400 mt-1">₹{paymentModalDue.totalDue}</p>

            {/* Simulated UPI QR Code */}
            <div className="mx-auto my-4 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/40 bg-white p-2">
              <div className="flex flex-col items-center justify-center text-slate-800">
                <div className="h-36 w-36 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:12px_12px] flex items-center justify-center">
                  <span className="rounded-md bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">
                    UPI QR SCAN
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 mt-1">
                  UPI ID: {paymentModalDue.shopMobile.replace(/\D/g, '')}@okaxis
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Scan using Google Pay, PhonePe, Paytm or BHIM</p>

            <button
              onClick={() => {
                setPaymentSuccess(true)
                recordKhataRepayment(paymentModalDue.id, paymentModalDue.totalDue)
                setTimeout(() => {
                  setPaymentSuccess(false)
                  setPaymentModalDue(null)
                  setShowKhata(false)
                }, 1600)
              }}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              {paymentSuccess ? '✓ Payment Settled in Real-Time!' : 'Simulate Successful UPI Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Voice Assistant Trigger for Village Customers */}
      <button
        onClick={() => setShowVoiceModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-emerald-900/50 hover:scale-105 transition-all active:scale-95 border border-emerald-300/30"
        title="Ask Village Store Voice AI"
      >
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <Mic className="h-5 w-5" />
        <span>{lang === 'kn' ? 'ಗ್ರಾಮೀಣ ಸಹಾಯಕ (ಮಾತನಾಡಿ)' : lang === 'hi' ? 'बोलकर पूछें (AI)' : 'Ask Village AI'}</span>
      </button>

      {/* Customer Voice Assistant Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">
                    {lang === 'kn' ? 'ಗ್ರಾಮೀಣ ಸಾರಥಿ ಧ್ವನಿ ಸಹಾಯಕ (ಗ್ರಾಹಕ ಮೋಡ್)' : lang === 'hi' ? 'ग्रामीण सारथी वॉयस असिस्टेंट (ग्राहक सहायता)' : 'GraminSarthi Customer Voice Assistant'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {lang === 'kn' ? 'ದರಗಳು, ಹವಾಮಾನ, ಖಾತೆ ಮಾಹಿತಿ ಅಥವಾ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಧ್ವನಿಯ ಮೂಲಕ ಕೇಳಿ' : lang === 'hi' ? 'दुकान के भाव, मौसम, खाता या हिसाब बोलकर पूछें' : 'Ask store rates, village weather, khata balance, or calculations by voice'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <VoiceAssistant
              lang={lang}
              mode="customer"
              merchantId={currentCustomer?.id || 'village_customer'}
              businessId={shops[0]?.id || 'village_market'}
              isModal={true}
              onClose={() => setShowVoiceModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
