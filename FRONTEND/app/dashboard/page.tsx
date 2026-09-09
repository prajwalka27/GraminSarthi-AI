'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/graminsarthi/dashboard'
import { CustomerPortal } from '@/components/graminsarthi/customer-portal'
import { makeT, type Lang } from '@/lib/graminsarthi/i18n'
import type { ShopProfileKey } from '@/lib/graminsarthi/data'
import { apiRequest } from '@/lib/api'
import { Loader2 } from 'lucide-react'

type DashboardView = 'MERCHANT' | 'CUSTOMER'

export default function DashboardPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [view, setView] = useState<DashboardView>('MERCHANT')
  const [lang, setLang] = useState<Lang>('en')
  const [shop, setShop] = useState<ShopProfileKey>('kirana')

  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await apiRequest<{
          success: boolean
          user?: {
            id: string
            name: string
            email: string
            phone?: string
            role: string
            merchantId?: string
            businessId?: string
          }
        }>('/api/auth/me')

        if (res.success && res.user) {
          setUser(res.user)
          if (res.user.merchantId && typeof window !== 'undefined') {
            localStorage.setItem('graminsarthi.merchantId', res.user.merchantId)
            sessionStorage.setItem('graminsarthi.merchantId', res.user.merchantId)
          }
          if (res.user.businessId && typeof window !== 'undefined') {
            localStorage.setItem('graminsarthi.businessId', res.user.businessId)
            sessionStorage.setItem('graminsarthi.businessId', res.user.businessId)
          }
          setCheckingAuth(false)
        } else {
          router.replace('/login')
        }
      } catch {
        router.replace('/login')
      }
    }

    verifySession()
  }, [router])

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Proceed with client cleanup regardless
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('graminsarthi.token')
      localStorage.removeItem('graminsarthi.merchantId')
      localStorage.removeItem('graminsarthi.businessId')
      localStorage.removeItem('graminsarthi.userId')
      localStorage.removeItem('graminsarthi.userName')
      localStorage.removeItem('graminsarthi.mobile')

      sessionStorage.removeItem('graminsarthi.token')
      sessionStorage.removeItem('graminsarthi.merchantId')
      sessionStorage.removeItem('graminsarthi.businessId')
      sessionStorage.removeItem('graminsarthi.userId')
      sessionStorage.removeItem('graminsarthi.userName')
      sessionStorage.removeItem('graminsarthi.mobile')
    }

    router.replace('/login')
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="mt-3 text-xs font-medium text-muted-foreground">Verifying secure session...</p>
      </div>
    )
  }

  if (view === 'CUSTOMER') {
    return (
      <CustomerPortal
        lang={lang}
        onLangChange={setLang}
        onSwitchToMerchant={() => setView('MERCHANT')}
        onBack={() => setView('MERCHANT')}
      />
    )
  }

  return (
    <Dashboard
      key={`${shop}-${user?.merchantId || user?.id}`}
      lang={lang}
      onLangChange={setLang}
      t={t}
      initialShop={shop}
      merchantId={user?.merchantId || user?.id}
      onSwitchToCustomer={() => setView('CUSTOMER')}
      onLogout={handleLogout}
    />
  )
}
