'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 font-bold text-white shadow-lg shadow-emerald-500/20',
        className,
      )}
      aria-hidden="true"
    >
      GS
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-xl shadow-black/20',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  icon,
  title,
  subtitle,
  accent = 'sky',
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  accent?: 'sky' | 'emerald' | 'amber' | 'rose' | 'teal'
}) {
  const accents: Record<string, string> = {
    sky: 'bg-sky-500/15 text-sky-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    amber: 'bg-amber-500/15 text-amber-300',
    rose: 'bg-rose-500/15 text-rose-300',
    teal: 'bg-teal-500/15 text-teal-300',
  }
  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          accents[accent],
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-tight text-foreground text-balance">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
  htmlFor,
}: {
  label: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const controlClass =
  'w-full min-h-12 rounded-xl border border-input bg-secondary px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(controlClass, 'appearance-none pr-10', props.className)}
    />
  )
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:from-sky-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 active:scale-[0.99] disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
