'use client'

import { useState } from 'react'
import { BookOpen, Plus, Trash2, Edit2, Check, X, Calculator } from 'lucide-react'
import { Card, CardHeader, Field, Select, TextInput, PrimaryButton } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import { formatINR, type Financials } from '@/lib/graminsarthi/data'
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
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void
  removeTransaction: (id: string) => void
  updateTransaction?: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void
  onRecalculate: () => void
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [newType, setNewType] = useState<TransactionType>('INCOME')
  const [newAmount, setNewAmount] = useState(0)
  const [newDesc, setNewDesc] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState(0)
  const [editDesc, setEditDesc] = useState('')

  // Step-wise calculator states
  const [calcIncome, setCalcIncome] = useState(financials.dailySales * 30)
  const [calcExpense, setCalcExpense] = useState(financials.dailyExpenses * 30)
  const [calcInvestment, setCalcInvestment] = useState(monthlyInvestment)
  const [calcOverheads, setCalcOverheads] = useState(0)
  const [calcResult, setCalcResult] = useState<number | null>(null)

  const handleAdd = () => {
    if (newAmount > 0) {
      addTransaction({ type: newType, amount: newAmount, description: newDesc || 'Transaction' })
      setNewAmount(0)
      setNewDesc('')
      setIsAdding(false)
      onRecalculate()
    }
  }
  
  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id)
    setEditAmount(txn.amount)
    setEditDesc(txn.description)
  }
  
  const saveEdit = (id: string) => {
    if (updateTransaction) {
      updateTransaction(id, { amount: editAmount, description: editDesc })
      onRecalculate()
    }
    setEditingId(null)
  }

  const handleCalculatePnL = () => {
    const profitOrLoss = calcIncome - calcExpense - calcInvestment - calcOverheads
    setCalcResult(profitOrLoss)
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
          <div className="flex min-h-10 w-full items-center rounded-xl border border-input bg-secondary/50 px-3 text-sm text-muted-foreground font-medium">
            {tradeCategory}
          </div>
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
              <div className="grid grid-cols-2 gap-2">
                <Select value={newType} onChange={e => setNewType(e.target.value as TransactionType)}>
                  <option value="INCOME">Income (Sale)</option>
                  <option value="EXPENSE">Expense</option>
                </Select>
                <CurrencyInput id="new-amount" value={newAmount} onChange={setNewAmount} />
              </div>
              <TextInput 
                id="new-desc" 
                placeholder="Description..." 
                value={newDesc} 
                onChange={e => setNewDesc(e.target.value)} 
              />
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs rounded border border-border text-muted-foreground hover:bg-secondary">Cancel</button>
                <button onClick={handleAdd} className="px-3 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-500">Save</button>
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {transactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No transactions yet.</p>
            ) : (
              transactions.map(txn => (
                <div key={txn.id} className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/50 p-2 text-sm">
                  {editingId === txn.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <CurrencyInput id={`edit-amt-${txn.id}`} value={editAmount} onChange={setEditAmount} />
                        <TextInput id={`edit-desc-${txn.id}`} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                        <button onClick={() => saveEdit(txn.id)} className="p-1 text-emerald-400 hover:text-emerald-300"><Check className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${txn.type === 'INCOME' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className="font-medium">{txn.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono ${txn.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {txn.type === 'INCOME' ? '+' : '-'}{formatINR(txn.amount)}
                        </span>
                        <button onClick={() => startEdit(txn)} className="text-muted-foreground hover:text-sky-300 transition">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { removeTransaction(txn.id); onRecalculate() }} className="text-muted-foreground hover:text-rose-400 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
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

        {/* Step-wise P&L Calculator */}
        <div className="border-t border-border pt-6 mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <Calculator className="h-4 w-4 text-emerald-400" />
            Step-Wise Monthly P&L Calculator
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starting Income (Monthly)" htmlFor="calc-income">
              <CurrencyInput id="calc-income" value={calcIncome} onChange={setCalcIncome} />
            </Field>
            <Field label="Total Expense (Monthly)" htmlFor="calc-expense">
              <CurrencyInput id="calc-expense" value={calcExpense} onChange={setCalcExpense} />
            </Field>
            <Field label="Monthly Investment" htmlFor="calc-investment">
              <CurrencyInput id="calc-investment" value={calcInvestment} onChange={setCalcInvestment} />
            </Field>
            <Field label="Monthly Overheads" htmlFor="calc-overheads">
              <CurrencyInput id="calc-overheads" value={calcOverheads} onChange={setCalcOverheads} />
            </Field>
          </div>
          
          <PrimaryButton onClick={handleCalculatePnL} className="w-full mt-4">
            Calculate Profit & Loss
          </PrimaryButton>

          {calcResult !== null && (
            <div className={`mt-4 rounded-xl border p-4 text-center ${
              calcResult >= 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1">
                {calcResult >= 0 ? 'Net Profit' : 'Net Loss'}
              </div>
              <div className="text-2xl font-bold font-mono">
                {formatINR(calcResult)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
