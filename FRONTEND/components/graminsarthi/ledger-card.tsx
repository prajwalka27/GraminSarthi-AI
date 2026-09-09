'use client'

import { useState } from 'react'
import { BookOpen, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Card, CardHeader, Field, Select, TextInput } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import { TRADE_CATEGORIES, formatINR, type Financials } from '@/lib/graminsarthi/data'
import type { Transaction, TransactionType } from '@/hooks/use-graminsarthi-store'

function CurrencyInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-input bg-secondary focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30">
      <span className="flex min-h-10 items-center border-r border-input px-3 font-mono text-base text-emerald-300">
        ₹
      </span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="min-h-10 w-full bg-transparent px-3 font-mono text-sm text-foreground outline-none"
      />
    </div>
  )
}

export function LedgerCard({
  t,
  tradeCategory,
  onTradeCategory,
  financials,
  monthlyInvestment,
  setMonthlyInvestment,
  transactions,
  addTransaction,
  removeTransaction,
  updateTransaction,
  onRecalculate,
}: {
  t: (k: TranslationKey) => string
  tradeCategory: string
  onTradeCategory: (c: string) => void
  financials: Financials
  monthlyInvestment: number
  setMonthlyInvestment: (n: number) => void
  transactions: Transaction[]
  addTransaction: (t: { type: string; amount: number; description: string; date?: string }) => void
  removeTransaction: (id: string) => void
  updateTransaction?: (id: string, updates: Partial<{ type: string; amount: number; description: string; date?: string }>) => void
  onRecalculate: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [isAdding, setIsAdding] = useState(false)
  const [newType, setNewType] = useState<string>('SALE')
  const [newAmount, setNewAmount] = useState(0)
  const [newDesc, setNewDesc] = useState('')
  const [newDate, setNewDate] = useState(today)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState('SALE')
  const [editAmount, setEditAmount] = useState(0)
  const [editDesc, setEditDesc] = useState('')
  const [editDate, setEditDate] = useState(today)

  const handleAdd = () => {
    if (newAmount > 0) {
      addTransaction({
        type: newType,
        amount: newAmount,
        description: newDesc.trim() || newType,
        date: newDate || today,
      })
      setNewAmount(0)
      setNewDesc('')
      setNewDate(today)
      setIsAdding(false)
      onRecalculate()
    }
  }

  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id)
    setEditType(txn.type)
    setEditAmount(txn.amount)
    setEditDesc(txn.description)
    setEditDate(txn.date || today)
  }

  const saveEdit = (id: string) => {
    if (updateTransaction) {
      updateTransaction(id, {
        type: editType,
        amount: editAmount,
        description: editDesc,
        date: editDate,
      })
      onRecalculate()
    }
    setEditingId(null)
  }

  const getTypeStyle = (type: string) => {
    const upper = type.toUpperCase()
    if (upper === 'SALE' || upper === 'INCOME') {
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
        sign: '+',
      }
    }
    if (upper === 'PURCHASE' || upper === 'STOCK_COST') {
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400',
        text: 'text-amber-300',
        sign: '-',
      }
    }
    return {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dot: 'bg-rose-400',
      text: 'text-rose-300',
      sign: '-',
    }
  }

  return (
    <Card>
      <CardHeader
        icon={<BookOpen className="h-5 w-5" />}
        title={t('ledgerTitle')}
        subtitle={t('ledgerSubtitle')}
        accent="emerald"
      />

      <div className="space-y-6">
        <Field label={t('tradeCategory')} htmlFor="ledger-category">
          <Select
            id="ledger-category"
            value={tradeCategory}
            onChange={(e) => onTradeCategory(e.target.value)}
          >
            {TRADE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              <Plus className="h-3 w-3" /> Add New
            </button>
          </div>

          {isAdding && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Type</label>
                  <Select value={newType} onChange={e => setNewType(e.target.value)}>
                    <option value="SALE">SALE (Income / Sales)</option>
                    <option value="PURCHASE">PURCHASE (Stock / Cost)</option>
                    <option value="EXPENSE">EXPENSE (General Expense)</option>
                    <option value="RENT">RENT</option>
                    <option value="POWER">POWER / Electricity</option>
                    <option value="LABOR">LABOR</option>
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="OVERHEAD">OVERHEAD</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Amount (₹)</label>
                  <CurrencyInput id="new-amount" value={newAmount} onChange={setNewAmount} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="min-h-10 w-full rounded-xl border border-input bg-secondary px-3 text-xs text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">Description</label>
                <TextInput
                  id="new-desc"
                  placeholder="e.g. Sold rice bags, purchased milk, electricity bill..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs rounded-xl border border-border text-muted-foreground hover:bg-secondary">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition">Save Entry</button>
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No transactions recorded yet.</p>
            ) : (
              transactions.map(txn => {
                const style = getTypeStyle(txn.type)
                return (
                  <div key={txn.id} className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/50 p-2.5 text-sm transition hover:border-border/80">
                    {editingId === txn.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Select value={editType} onChange={e => setEditType(e.target.value)}>
                            <option value="SALE">SALE</option>
                            <option value="PURCHASE">PURCHASE</option>
                            <option value="EXPENSE">EXPENSE</option>
                            <option value="RENT">RENT</option>
                            <option value="POWER">POWER</option>
                            <option value="LABOR">LABOR</option>
                            <option value="TRANSPORT">TRANSPORT</option>
                            <option value="OVERHEAD">OVERHEAD</option>
                          </Select>
                          <CurrencyInput id={`edit-amt-${txn.id}`} value={editAmount} onChange={setEditAmount} />
                          <input
                            type="date"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="min-h-10 rounded-xl border border-input bg-secondary px-3 text-xs text-foreground outline-none"
                          />
                        </div>
                        <TextInput id={`edit-desc-${txn.id}`} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                          <button onClick={() => saveEdit(txn.id)} className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"><Check className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{txn.description}</span>
                              <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                                {txn.type}
                              </span>
                            </div>
                            {txn.date && (
                              <span className="text-[10px] text-muted-foreground">{txn.date}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-semibold ${style.text}`}>
                            {style.sign}{formatINR(txn.amount)}
                          </span>
                          <button onClick={() => startEdit(txn)} aria-label="Edit transaction" className="text-muted-foreground hover:text-sky-300 transition">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { removeTransaction(txn.id); onRecalculate() }} aria-label="Delete transaction" className="text-muted-foreground hover:text-rose-400 transition">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <Field label={t('monthlyInvestment')} htmlFor="monthly-investment">
            <CurrencyInput
              id="monthly-investment"
              value={monthlyInvestment}
              onChange={(n) => { setMonthlyInvestment(n); onRecalculate() }}
            />
          </Field>
        </div>
      </div>
    </Card>
  )
}
