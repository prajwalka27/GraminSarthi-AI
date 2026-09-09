'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sprout, Mail, Lock, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setNotice('Registration successful. Please login with your email and password.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    try {
      setLoading(true)
      const res = await apiRequest<{
        success: boolean
        message: string
        token?: string
        user?: {
          id: string
          name: string
          email: string
          phone?: string
          role: string
          merchantId?: string
          businessId?: string
        }
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      })

      if (res.success && res.user) {
        if (typeof window !== 'undefined') {
          if (res.token) {
            localStorage.setItem('graminsarthi.token', res.token)
            sessionStorage.setItem('graminsarthi.token', res.token)
          }
          if (res.user.merchantId) {
            localStorage.setItem('graminsarthi.merchantId', res.user.merchantId)
            sessionStorage.setItem('graminsarthi.merchantId', res.user.merchantId)
          }
          if (res.user.businessId) {
            localStorage.setItem('graminsarthi.businessId', res.user.businessId)
            sessionStorage.setItem('graminsarthi.businessId', res.user.businessId)
          }
          localStorage.setItem('graminsarthi.userId', res.user.id)
          sessionStorage.setItem('graminsarthi.userId', res.user.id)
          localStorage.setItem('graminsarthi.userName', res.user.name)
          sessionStorage.setItem('graminsarthi.userName', res.user.name)
          if (res.user.phone) {
            localStorage.setItem('graminsarthi.mobile', res.user.phone)
            sessionStorage.setItem('graminsarthi.mobile', res.user.phone)
          }
        }
        router.push('/dashboard')
      } else {
        setError(res.message || 'Invalid email or password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-secondary/30 px-4 py-8 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 shadow-xl shadow-emerald-950/30">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            GraminSarthi<span className="text-emerald-400">.AI</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-emerald-400/90">
            AI-Powered Rural Enterprise Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sign in with your email and password to access your dashboard
            </p>
          </div>

          {notice && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-foreground/90">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-secondary/50 py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-foreground/90">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-secondary/50 py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:from-emerald-500 hover:to-sky-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <p className="text-center text-[11px] text-muted-foreground/70">
          🔒 Secure authentication with bcrypt encryption & HTTP-only sessions
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
