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
    Filter
} from 'lucide-react'
import { BrandMark } from './primitives'
import { LanguageSelect } from './language-select'
import type { Lang, TranslationKey } from '@/lib/graminsarthi/i18n'

// Types for Customer Interface
export type ShopCategory = 'all' | 'kirana' | 'dairy' | 'farm' | 'tea'

export interface ProductItem {
    id: string
    name: string
    category: ShopCategory
    price: number
    unit: string
    shopName: string
    shopMobile: string
    available: boolean
    tag?: string
    imageBg: string
}

export interface VillageShop {
    id: string
    name: string
    owner: string
    category: ShopCategory
    categoryLabel: string
    distance: string
    village: string
    mobile: string
    rating: number
    isOpen: boolean
    khataEnabled: boolean
}

export interface KhataRecord {
    id: string
    shopName: string
    owner: string
    phone: string
    totalDue: number
    lastPurchaseDate: string
    itemsSummary: string
}

export interface CartItem {
    product: ProductItem
    qty: number
}

const SAMPLE_PRODUCTS: ProductItem[] = [
    { id: 'p1', name: 'Fresh Buffalo Milk', category: 'dairy', price: 34, unit: '500ml', shopName: 'Gopal Dairy Point', shopMobile: '+919876543211', available: true, tag: 'Morning Batch', imageBg: 'from-blue-500/20 to-cyan-500/10' },
    { id: 'p2', name: 'Desi Cow Ghee (Pure)', category: 'dairy', price: 650, unit: '1 kg', shopName: 'Gopal Dairy Point', shopMobile: '+919876543211', available: true, tag: 'Bilona', imageBg: 'from-amber-500/20 to-yellow-500/10' },
    { id: 'p3', name: 'Chakki Fresh Sharbati Atta', category: 'kirana', price: 42, unit: '1 kg', shopName: 'Sri Lakshmi Provisions', shopMobile: '+919876543210', available: true, tag: 'Best Seller', imageBg: 'from-amber-600/20 to-orange-500/10' },
    { id: 'p4', name: 'Sona Masoori Rice (Old Harvest)', category: 'kirana', price: 56, unit: '1 kg', shopName: 'Sri Lakshmi Provisions', shopMobile: '+919876543210', available: true, imageBg: 'from-emerald-500/20 to-teal-500/10' },
    { id: 'p5', name: 'Polished Toor Dal', category: 'kirana', price: 148, unit: '1 kg', shopName: 'Sri Lakshmi Provisions', shopMobile: '+919876543210', available: true, imageBg: 'from-yellow-500/20 to-amber-500/10' },
    { id: 'p6', name: 'Cold-Pressed Mustard Oil', category: 'kirana', price: 135, unit: '1 Litre', shopName: 'Ramesh Kirana Store', shopMobile: '+919876543210', available: true, tag: 'Kachhi Ghani', imageBg: 'from-yellow-600/20 to-orange-500/10' },
    { id: 'p7', name: 'Organic Village Jaggery (Gur)', category: 'farm', price: 60, unit: '1 kg', shopName: 'Kisan Samriddhi Center', shopMobile: '+919876543213', available: true, tag: 'Chemical-Free', imageBg: 'from-amber-700/20 to-orange-600/10' },
    { id: 'p8', name: 'Hybrid Wheat Seeds (HD-2967)', category: 'farm', price: 320, unit: '10 kg bag', shopName: 'Kisan Samriddhi Center', shopMobile: '+919876543213', available: true, tag: 'Certified', imageBg: 'from-green-500/20 to-emerald-600/10' },
    { id: 'p9', name: 'Kadak Masala Chai Patti', category: 'tea', price: 90, unit: '250 gm', shopName: 'Chai Point & Snacks', shopMobile: '+919876543212', available: true, imageBg: 'from-orange-500/20 to-red-500/10' },
    { id: 'p10', name: 'Fresh Milk Paneer', category: 'dairy', price: 110, unit: '250 gm', shopName: 'Gopal Dairy Point', shopMobile: '+919876543211', available: true, tag: 'Fresh', imageBg: 'from-cyan-500/20 to-blue-500/10' }
]

const SAMPLE_SHOPS: VillageShop[] = [
    { id: 's1', name: 'Sri Lakshmi Provisions', owner: 'Ramesh Kumar', category: 'kirana', categoryLabel: 'Grocery / Kirana', distance: '350m', village: 'Rampur Village', mobile: '+919876543210', rating: 4.8, isOpen: true, khataEnabled: true },
    { id: 's2', name: 'Gopal Dairy Point', owner: 'Gopal Yadav', category: 'dairy', categoryLabel: 'Dairy & Milk Point', distance: '500m', village: 'Rampur West', mobile: '+919876543211', rating: 4.9, isOpen: true, khataEnabled: true },
    { id: 's3', name: 'Kisan Samriddhi Center', owner: 'Baldev Singh', category: 'farm', categoryLabel: 'Seeds, Jaggery & Agro', distance: '800m', village: 'Mandi Road', mobile: '+919876543213', rating: 4.7, isOpen: true, khataEnabled: false },
    { id: 's4', name: 'Chai Point & Snacks', owner: 'Suresh Sharma', category: 'tea', categoryLabel: 'Tea Stall & Refreshments', distance: '200m', village: 'Bus Stand', mobile: '+919876543212', rating: 4.6, isOpen: true, khataEnabled: true }
]

const SAMPLE_KHATA: KhataRecord[] = [
    { id: 'k1', shopName: 'Sri Lakshmi Provisions', owner: 'Ramesh Kumar', phone: '+919876543210', totalDue: 480, lastPurchaseDate: 'Yesterday', itemsSummary: '2kg Atta, 1L Mustard Oil, Tea' },
    { id: 'k2', shopName: 'Gopal Dairy Point', owner: 'Gopal Yadav', phone: '+919876543211', totalDue: 210, lastPurchaseDate: '07 Sep 2026', itemsSummary: '3x 500ml Buffalo Milk, 250g Paneer' }
]

export function CustomerPortal({
    lang,
    onLangChange,
    onSwitchToMerchant,
    onBack,
}: {
    lang: Lang
    onLangChange: (l: Lang) => void
    onSwitchToMerchant: () => void
    onBack: () => void
}) {
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [cart, setCart] = useState<CartItem[]>([])
    const [showCart, setShowCart] = useState(false)
    const [showKhata, setShowKhata] = useState(false)
    const [selectedShop, setSelectedShop] = useState<VillageShop | null>(null)
    const [paymentModalDue, setPaymentModalDue] = useState<KhataRecord | null>(null)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [orderPlaced, setOrderPlaced] = useState(false)

    // Filter products
    const filteredProducts = useMemo(() => {
        return SAMPLE_PRODUCTS.filter((p) => {
            const matchesCat = selectedCategory === 'all' || p.category === selectedCategory
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.shopName.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesCat && matchesSearch
        })
    }, [selectedCategory, searchQuery])

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

    // Generate WhatsApp ordering link
    const handleWhatsAppOrder = () => {
        if (cart.length === 0) return
        const shop = cart[0].product.shopName
        const phone = cart[0].product.shopMobile.replace(/\D/g, '')
        const itemsList = cart
            .map((item) => `• ${item.product.name} (${item.qty} x ${item.product.unit}) = ₹${item.product.price * item.qty}`)
            .join('\n')

        const message = encodeURIComponent(
            `*New Order via GraminSarthi Customer App*\n\n` +
            `Hello ${shop},\n` +
            `Please confirm my order:\n${itemsList}\n\n` +
            `*Total Amount: ₹${cartTotal}*\n` +
            `Delivery: Village Doorstep / Store Pickup\n` +
            `Thank you!`
        )

        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
        setOrderPlaced(true)
        setTimeout(() => {
            setOrderPlaced(false)
            setShowCart(false)
            clearCart()
        }, 2500)
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top Navigation Bar */}
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
                                    Customer
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 text-emerald-400" />
                                <span>Rampur Village, Ward 4</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Digital Khata button */}
                        <button
                            onClick={() => setShowKhata(true)}
                            className="relative hidden items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 sm:inline-flex"
                        >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>My Khata (उधार)</span>
                            <span className="ml-1 rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] text-amber-200">
                                ₹690
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
                            className="hidden rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-sky-500/50 hover:text-sky-300 md:inline-flex"
                        >
                            🏪 Merchant Login
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {/* Hero / Banner for Customer */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-card to-background p-6 sm:p-8">
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Village Super-Market & Digital Khata</span>
                        </div>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Local Village Goods, Fair Prices & Direct Orders
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                            Order fresh milk, groceries, farming seeds, and daily staples from verified local shops in your village with home delivery or pickup.
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
                                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                                    isActive
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
                        {SAMPLE_SHOPS.map((shop) => (
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
                            <p className="text-xs text-muted-foreground">Order online or add to your local shop khata</p>
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
                                        {/* Product Tag / Icon Header */}
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
                                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-[0.98]"
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

            {/* Cart Slide-Over / Drawer */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                    <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-card p-6 shadow-2xl">
                        <div>
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-emerald-400" />
                                    <h2 className="text-lg font-bold text-foreground">My Order Cart</h2>
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
                                    <p className="text-xs text-muted-foreground/60">Add groceries or staples from local shops</p>
                                </div>
                            ) : (
                                <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
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
                                    Pay via UPI / Cash on delivery or charge to your local shop khata.
                                </p>

                                {orderPlaced ? (
                                    <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 py-3 text-sm font-semibold text-emerald-300">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        <span>Order Sent to Merchant via WhatsApp!</span>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-2">
                                        <button
                                            onClick={handleWhatsAppOrder}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            <span>Send Order via WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={clearCart}
                                            className="inline-flex w-full items-center justify-center py-2 text-xs font-medium text-muted-foreground hover:text-rose-400"
                                        >
                                            Clear Cart
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* My Digital Khata Modal */}
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
                                    <p className="text-xs text-muted-foreground">Credit balance with verified local shops</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowKhata(false)}
                                className="rounded-xl border border-border p-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {SAMPLE_KHATA.map((k) => (
                                <div
                                    key={k.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-secondary p-4 sm:flex-row sm:items-center"
                                >
                                    <div>
                                        <h4 className="font-semibold text-foreground">{k.shopName}</h4>
                                        <p className="text-xs text-muted-foreground">Shopkeeper: {k.owner} ({k.phone})</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                            Last bill: {k.itemsSummary} • {k.lastPurchaseDate}
                                        </p>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Due Amount</span>
                                            <p className="text-base font-bold text-amber-400">₹{k.totalDue}</p>
                                        </div>
                                        <button
                                            onClick={() => setPaymentModalDue(k)}
                                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                                        >
                                            Pay via UPI
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                                    UPI ID: {paymentModalDue.phone.replace(/\D/g, '')}@okaxis
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">Scan using Google Pay, PhonePe, Paytm or BHIM</p>

                        <button
                            onClick={() => {
                                setPaymentSuccess(true)
                                setTimeout(() => {
                                    setPaymentSuccess(false)
                                    setPaymentModalDue(null)
                                    setShowKhata(false)
                                }, 1800)
                            }}
                            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-500"
                        >
                            {paymentSuccess ? '✓ Payment Confirmed!' : 'Simulate Successful UPI Payment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
