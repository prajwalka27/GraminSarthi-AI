'use client'

import { useState } from 'react'
import { ArrowUpRight, Repeat, Search, TrendingUp, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Card, CardHeader, PrimaryButton, Select, TextInput } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import { formatINR, type ShopProfile } from '@/lib/graminsarthi/data'
import type { InventoryItem, InventoryCategory } from '@/hooks/use-graminsarthi-store'

export function InventoryCard({
  t,
  profile,
  inventoryItems,
  addInventoryItem,
  removeInventoryItem,
}: {
  t: (k: TranslationKey) => string
  profile: ShopProfile
  inventoryItems: InventoryItem[]
  addInventoryItem: (i: Omit<InventoryItem, 'id'>) => void
  removeInventoryItem: (id: string) => void
}) {
  const [opportunityIdx, setOpportunityIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCat, setNewCat] = useState<InventoryCategory>('REGULAR')

  const handleAdd = () => {
    if (newName.trim()) {
      addInventoryItem({ name: newName.trim(), category: newCat })
      setNewName('')
      setNewCat('REGULAR')
      setIsAdding(false)
    }
  }

  const starItems = inventoryItems.filter(i => i.category === 'STAR')
  const underItems = inventoryItems.filter(i => i.category === 'UNDERPERFORMING')
  const regularItems = inventoryItems.filter(i => i.category === 'REGULAR')

  return (
    <Card>
      <CardHeader
        icon={<Repeat className="h-5 w-5" />}
        title={t('inventoryTitle')}
        subtitle={t('inventorySubtitle')}
        accent="teal"
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Current Stock & Inventory</h3>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition"
            >
              <Plus className="h-3 w-3" /> Add Product
            </button>
          </div>

          {isAdding && (
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3 space-y-3">
              <TextInput 
                id="new-product-name" 
                placeholder="Product Name..." 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
              />
              <Select value={newCat} onChange={e => setNewCat(e.target.value as InventoryCategory)}>
                <option value="REGULAR">Regular Item</option>
                <option value="STAR">Star Product (High Margin)</option>
                <option value="UNDERPERFORMING">Underperforming (Low Margin)</option>
              </Select>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs rounded border border-border text-muted-foreground hover:bg-secondary">Cancel</button>
                <button onClick={handleAdd} className="px-3 py-1 text-xs rounded bg-teal-600 text-white hover:bg-teal-500">Save</button>
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {inventoryItems.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No items in inventory.</p>
            ) : (
              inventoryItems.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      item.category === 'STAR' ? 'bg-amber-400' : 
                      item.category === 'UNDERPERFORMING' ? 'bg-rose-400' : 
                      'bg-slate-400'
                    }`} />
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {item.category === 'STAR' ? 'Star Product' : 
                       item.category === 'UNDERPERFORMING' ? 'Underperforming' : 
                       'Regular'}
                    </span>
                    <button onClick={() => removeInventoryItem(item.id)} className="text-muted-foreground hover:text-rose-400 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <div>
            <label htmlFor="opportunity" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('valueAdd')}
            </label>
            <Select
              id="opportunity"
              value={opportunityIdx}
              onChange={(e) => setOpportunityIdx(Number(e.target.value))}
            >
              {profile.opportunities.map((o, i) => (
                <option key={o.label} value={i}>
                  {o.label} (+{formatINR(o.gain)}
                  {t('perMonth')})
                </option>
              ))}
            </Select>
          </div>

          <PrimaryButton
            onClick={() => setRevealed(true)}
            className="from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 shadow-teal-600/25"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {t('findSwaps')}
          </PrimaryButton>

          {revealed ? (
            <ul className="space-y-2.5">
              {profile.opportunities.map((o, i) => (
                <li
                  key={o.label}
                  className={`rounded-xl border p-4 transition ${
                    i === opportunityIdx
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-border bg-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-foreground text-pretty">
                        {o.label}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-emerald-500/15 px-2 py-1 font-mono text-sm font-semibold text-emerald-300">
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatINR(o.gain)}
                      {t('perMonth')}
                    </span>
                  </div>
                  <p className="mt-2 pl-6 text-xs leading-relaxed text-muted-foreground">
                    {o.detail}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
