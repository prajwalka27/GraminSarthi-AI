'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import { Loader2, Sprout } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiRequest<{ success: boolean; user?: any }>('/api/auth/me')
        if (res.success && res.user) {
          router.replace('/dashboard')
        } else {
          router.replace('/register')
        }
      } catch {
        router.replace('/register')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 shadow-xl shadow-emerald-950/30">
        <Sprout className="h-6 w-6 text-white" />
      </div>
      <Loader2 className="mt-4 h-6 w-6 animate-spin text-emerald-400" />
      <p className="mt-2 text-xs text-muted-foreground">Loading GraminSarthi-AI...</p>
    </div>
  )
}
