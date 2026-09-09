'use client'

import { useState, useEffect, useCallback } from 'react'

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

export interface CustomerProfile {
  id: string
  name: string
  mobile: string
  village: string
  ward: string
  houseNo?: string
  creditLimit: number
  joinedDate: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  qty: number
  unit: string
  shopName: string
}

export interface VillageOrder {
  id: string
  customerId: string
  customerName: string
  customerMobile: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentMethod: 'cod' | 'upi' | 'khata'
  deliveryAddress: string
  createdAt: string
}

export interface KhataEntry {
  id: string
  customerId: string
  customerName: string
  customerMobile: string
  shopName: string
  shopOwner: string
  shopMobile: string
  totalDue: number
  creditLimit: number
  lastTransactionDate: string
  itemsSummary: string
  history: {
    id: string
    date: string
    type: 'CREDIT' | 'PAYMENT'
    amount: number
    note: string
  }[]
}

export const INITIAL_PRODUCTS: ProductItem[] = [
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

export const INITIAL_SHOPS: VillageShop[] = [
  { id: 's1', name: 'Sri Lakshmi Provisions', owner: 'Ramesh Kumar', category: 'kirana', categoryLabel: 'Grocery / Kirana', distance: '350m', village: 'Rampur Village', mobile: '+919876543210', rating: 4.8, isOpen: true, khataEnabled: true },
  { id: 's2', name: 'Gopal Dairy Point', owner: 'Gopal Yadav', category: 'dairy', categoryLabel: 'Dairy & Milk Point', distance: '500m', village: 'Rampur West', mobile: '+919876543211', rating: 4.9, isOpen: true, khataEnabled: true },
  { id: 's3', name: 'Kisan Samriddhi Center', owner: 'Baldev Singh', category: 'farm', categoryLabel: 'Seeds, Jaggery & Agro', distance: '800m', village: 'Mandi Road', mobile: '+919876543213', rating: 4.7, isOpen: true, khataEnabled: false },
  { id: 's4', name: 'Chai Point & Snacks', owner: 'Suresh Sharma', category: 'tea', categoryLabel: 'Tea Stall & Refreshments', distance: '200m', village: 'Bus Stand', mobile: '+919876543212', rating: 4.6, isOpen: true, khataEnabled: true }
]

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  { id: 'cust-1', name: 'Ramvilas Paswan', mobile: '+919876543220', village: 'Rampur', ward: 'Ward 3', houseNo: 'H-14', creditLimit: 2500, joinedDate: '15 Aug 2026' },
  { id: 'cust-2', name: 'Sunita Devi', mobile: '+919876543221', village: 'Rampur', ward: 'Ward 4', houseNo: 'H-29', creditLimit: 2000, joinedDate: '01 Sep 2026' },
  { id: 'cust-3', name: 'Kishanlal Sharma', mobile: '+919876543222', village: 'Rampur', ward: 'Ward 1', houseNo: 'H-07', creditLimit: 3000, joinedDate: '20 Jul 2026' }
]

export const INITIAL_ORDERS: VillageOrder[] = [
  {
    id: 'ord-101',
    customerId: 'cust-1',
    customerName: 'Ramvilas Paswan',
    customerMobile: '+919876543220',
    items: [
      { productId: 'p3', name: 'Chakki Fresh Sharbati Atta', price: 42, qty: 2, unit: '1 kg', shopName: 'Sri Lakshmi Provisions' },
      { productId: 'p6', name: 'Cold-Pressed Mustard Oil', price: 135, qty: 1, unit: '1 Litre', shopName: 'Ramesh Kirana Store' }
    ],
    totalAmount: 219,
    status: 'delivered',
    paymentMethod: 'khata',
    deliveryAddress: 'Ward 3, House H-14, Rampur',
    createdAt: 'Yesterday, 4:30 PM'
  },
  {
    id: 'ord-102',
    customerId: 'cust-2',
    customerName: 'Sunita Devi',
    customerMobile: '+919876543221',
    items: [
      { productId: 'p1', name: 'Fresh Buffalo Milk', price: 34, qty: 2, unit: '500ml', shopName: 'Gopal Dairy Point' },
      { productId: 'p10', name: 'Fresh Milk Paneer', price: 110, qty: 1, unit: '250 gm', shopName: 'Gopal Dairy Point' }
    ],
    totalAmount: 178,
    status: 'pending',
    paymentMethod: 'cod',
    deliveryAddress: 'Ward 4, House H-29, Rampur',
    createdAt: 'Today, 9:15 AM'
  }
]

export const INITIAL_KHATA: KhataEntry[] = [
  {
    id: 'k1',
    customerId: 'cust-1',
    customerName: 'Ramvilas Paswan',
    customerMobile: '+919876543220',
    shopName: 'Sri Lakshmi Provisions',
    shopOwner: 'Ramesh Kumar',
    shopMobile: '+919876543210',
    totalDue: 480,
    creditLimit: 2500,
    lastTransactionDate: 'Yesterday',
    itemsSummary: '2kg Atta, 1L Mustard Oil, Tea',
    history: [
      { id: 'h1', date: '08 Sep 2026', type: 'CREDIT', amount: 219, note: 'Grocery order #ord-101' },
      { id: 'h2', date: '01 Sep 2026', type: 'CREDIT', amount: 261, note: 'Sugar 2kg, Rice 3kg' }
    ]
  },
  {
    id: 'k2',
    customerId: 'cust-1',
    customerName: 'Ramvilas Paswan',
    customerMobile: '+919876543220',
    shopName: 'Gopal Dairy Point',
    shopOwner: 'Gopal Yadav',
    shopMobile: '+919876543211',
    totalDue: 210,
    creditLimit: 1500,
    lastTransactionDate: '07 Sep 2026',
    itemsSummary: '3x 500ml Buffalo Milk, 250g Paneer',
    history: [
      { id: 'h3', date: '07 Sep 2026', type: 'CREDIT', amount: 210, note: 'Morning milk & paneer' }
    ]
  },
  {
    id: 'k3',
    customerId: 'cust-2',
    customerName: 'Sunita Devi',
    customerMobile: '+919876543221',
    shopName: 'Sri Lakshmi Provisions',
    shopOwner: 'Ramesh Kumar',
    shopMobile: '+919876543210',
    totalDue: 340,
    creditLimit: 2000,
    lastTransactionDate: '05 Sep 2026',
    itemsSummary: 'Toor Dal 1kg, Salt, Spices',
    history: [
      { id: 'h4', date: '05 Sep 2026', type: 'CREDIT', amount: 340, note: 'Weekly spices & pulse' }
    ]
  }
]

const STORAGE_KEYS = {
  PRODUCTS: 'graminsarthi.village.products',
  CUSTOMERS: 'graminsarthi.village.customers',
  ACTIVE_CUSTOMER: 'graminsarthi.village.activeCustomer',
  ORDERS: 'graminsarthi.village.orders',
  KHATA: 'graminsarthi.village.khata'
}

export function useVillageStore() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS)
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(INITIAL_CUSTOMERS[0])
  const [orders, setOrders] = useState<VillageOrder[]>(INITIAL_ORDERS)
  const [khataRecords, setKhataRecords] = useState<KhataEntry[]>(INITIAL_KHATA)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      if (storedProds) setProducts(JSON.parse(storedProds))

      const storedCusts = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
      if (storedCusts) {
        const parsed = JSON.parse(storedCusts)
        setCustomers(parsed)
      }

      const activeCust = localStorage.getItem(STORAGE_KEYS.ACTIVE_CUSTOMER)
      if (activeCust) {
        setCurrentCustomer(JSON.parse(activeCust))
      } else {
        setCurrentCustomer(INITIAL_CUSTOMERS[0])
      }

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (storedOrders) setOrders(JSON.parse(storedOrders))

      const storedKhata = localStorage.getItem(STORAGE_KEYS.KHATA)
      if (storedKhata) setKhataRecords(JSON.parse(storedKhata))
    } catch (e) {
      console.error('Error loading village store from localStorage', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync back to LocalStorage
  const saveProducts = (prods: ProductItem[]) => {
    setProducts(prods)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods))
  }

  const saveCustomers = (custs: CustomerProfile[]) => {
    setCustomers(custs)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs))
  }

  const saveOrders = (ords: VillageOrder[]) => {
    setOrders(ords)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ords))
  }

  const saveKhata = (k: KhataEntry[]) => {
    setKhataRecords(k)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(k))
  }

  const selectCustomer = (c: CustomerProfile | null) => {
    setCurrentCustomer(c)
    if (typeof window !== 'undefined') {
      if (c) localStorage.setItem(STORAGE_KEYS.ACTIVE_CUSTOMER, JSON.stringify(c))
      else localStorage.removeItem(STORAGE_KEYS.ACTIVE_CUSTOMER)
    }
  }

  // Customer creates/registers themselves
  const registerCustomer = useCallback((profile: { name: string; mobile: string; village: string; ward: string; houseNo?: string }): CustomerProfile => {
    const newCust: CustomerProfile = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      name: profile.name,
      mobile: profile.mobile.startsWith('+91') ? profile.mobile : `+91${profile.mobile.replace(/\D/g, '')}`,
      village: profile.village || 'Rampur',
      ward: profile.ward || 'Ward 1',
      houseNo: profile.houseNo || 'Main Street',
      creditLimit: 2000,
      joinedDate: 'Today'
    }

    setCustomers(prev => {
      const updated = [newCust, ...prev]
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated))
      return updated
    })

    // Create an initial starter Khata with local Kirana
    const starterKhata: KhataEntry = {
      id: `k-${Date.now().toString().slice(-4)}`,
      customerId: newCust.id,
      customerName: newCust.name,
      customerMobile: newCust.mobile,
      shopName: 'Sri Lakshmi Provisions',
      shopOwner: 'Ramesh Kumar',
      shopMobile: '+919876543210',
      totalDue: 0,
      creditLimit: 2000,
      lastTransactionDate: 'Account Activated Today',
      itemsSummary: 'New Account Approved (₹2,000 Credit Limit)',
      history: []
    }

    setKhataRecords(prev => {
      const updated = [starterKhata, ...prev]
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(updated))
      return updated
    })

    selectCustomer(newCust)
    return newCust
  }, [])

  // Host adds a new product to the village market
  const addProduct = useCallback((item: { name: string; category: ShopCategory; price: number; unit: string; shopName: string; shopMobile: string; tag?: string }) => {
    const bgMap: Record<ShopCategory, string> = {
      all: 'from-emerald-500/20 to-teal-500/10',
      kirana: 'from-amber-600/20 to-orange-500/10',
      dairy: 'from-blue-500/20 to-cyan-500/10',
      farm: 'from-green-500/20 to-emerald-600/10',
      tea: 'from-orange-500/20 to-red-500/10'
    }

    const newProd: ProductItem = {
      id: `p${Date.now().toString().slice(-4)}`,
      name: item.name,
      category: item.category,
      price: item.price,
      unit: item.unit,
      shopName: item.shopName,
      shopMobile: item.shopMobile || '+919876543210',
      available: true,
      tag: item.tag || 'Village Fresh',
      imageBg: bgMap[item.category] || bgMap.kirana
    }

    setProducts(prev => {
      const updated = [newProd, ...prev]
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated))
      return updated
    })
    return newProd
  }, [])

  // Host toggles product availability
  const toggleProductAvailability = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, available: !p.available } : p)
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Host deletes a product
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id)
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Customer places an order
  const placeOrder = useCallback((orderData: {
    customerId: string
    customerName: string
    customerMobile: string
    items: OrderItem[]
    totalAmount: number
    paymentMethod: 'cod' | 'upi' | 'khata'
    deliveryAddress: string
  }): VillageOrder => {
    const newOrder: VillageOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      customerMobile: orderData.customerMobile,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      deliveryAddress: orderData.deliveryAddress,
      createdAt: 'Just now'
    }

    setOrders(prev => {
      const updated = [newOrder, ...prev]
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
      return updated
    })

    // If order was placed via Khata, add to customer's Khata balance
    if (orderData.paymentMethod === 'khata') {
      setKhataRecords(prev => {
        const matching = prev.find(k => k.customerId === orderData.customerId)
        if (matching) {
          const updated = prev.map(k => k.id === matching.id ? {
            ...k,
            totalDue: k.totalDue + orderData.totalAmount,
            lastTransactionDate: 'Just now',
            itemsSummary: orderData.items.map(i => `${i.name} (${i.qty})`).join(', '),
            history: [
              {
                id: `h-${Date.now().toString().slice(-4)}`,
                date: 'Today',
                type: 'CREDIT' as const,
                amount: orderData.totalAmount,
                note: `Order #${newOrder.id}`
              },
              ...k.history
            ]
          } : k)
          if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(updated))
          return updated
        }
        return prev
      })
    }

    return newOrder
  }, [])

  // Host updates order status
  const updateOrderStatus = useCallback((orderId: string, status: VillageOrder['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o)
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Customer or Host records a Khata repayment
  const recordKhataRepayment = useCallback((khataId: string, amount: number) => {
    setKhataRecords(prev => {
      const updated = prev.map(k => {
        if (k.id === khataId) {
          const newDue = Math.max(0, k.totalDue - amount)
          return {
            ...k,
            totalDue: newDue,
            lastTransactionDate: 'Repaid just now via UPI',
            history: [
              {
                id: `h-${Date.now().toString().slice(-4)}`,
                date: 'Today',
                type: 'PAYMENT' as const,
                amount,
                note: 'UPI QR Settlement'
              },
              ...k.history
            ]
          }
        }
        return k
      })
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Host issues credit or adds Khata entry
  const addKhataCredit = useCallback((khataId: string, amount: number, note: string = 'Manual Credit Issued') => {
    setKhataRecords(prev => {
      const updated = prev.map(k => {
        if (k.id === khataId) {
          return {
            ...k,
            totalDue: k.totalDue + amount,
            lastTransactionDate: 'Today',
            history: [
              {
                id: `h-${Date.now().toString().slice(-4)}`,
                date: 'Today',
                type: 'CREDIT' as const,
                amount,
                note
              },
              ...k.history
            ]
          }
        }
        return k
      })
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    isLoaded,
    products,
    shops: INITIAL_SHOPS,
    customers,
    currentCustomer,
    selectCustomer,
    registerCustomer,
    orders,
    placeOrder,
    updateOrderStatus,
    khataRecords,
    recordKhataRepayment,
    addKhataCredit,
    addProduct,
    toggleProductAvailability,
    deleteProduct
  }
}
