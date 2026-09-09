'use client'

import { useState } from 'react'
import { ArrowRightLeft, Repeat, TrendingDown, TrendingUp, Search } from 'lucide-react'
import { Card, CardHeader, PrimaryButton, Select } from './primitives'
import type { TranslationKey } from '@/lib/graminsarthi/i18n'
import type { InventoryItem } from '@/hooks/use-graminsarthi-store'

export function SwappingPortal({
  t,
  inventoryItems,
}: {
  t: (k: TranslationKey) => string
  inventoryItems: InventoryItem[]
}) {
  const underperformingItems = inventoryItems.filter((i) => i.category === 'UNDERPERFORMING')
  const starItems = inventoryItems.filter((i) => i.category === 'STAR')

  const [selectedUnder, setSelectedUnder] = useState(
    underperformingItems.length > 0 ? underperformingItems[0].id : ''
  )
  const [selectedStar, setSelectedStar] = useState(
    starItems.length > 0 ? starItems[0].id : ''
  )

  const [swapHistory, setSwapHistory] = useState<{ under: string; star: string }[]>([])

  const handleSwap = () => {
    if (selectedUnder && selectedStar) {
      const underName = underperformingItems.find(i => i.id === selectedUnder)?.name || ''
      const starName = starItems.find(i => i.id === selectedStar)?.name || ''
      setSwapHistory([{ under: underName, star: starName }, ...swapHistory])
    }
  }

  return (
    <Card>
      <CardHeader
        icon={<Repeat className="h-5 w-5" />}
        title="Swapping Portal"
        subtitle="Swap underperforming items with high-margin star products"
        accent="sky"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-400 mb-3">
              <TrendingDown className="h-4 w-4" /> Underperforming Demo Items
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {underperformingItems.length > 0 ? (
                underperformingItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    {item.name}
                  </li>
                ))
              ) : (
                <li>No underperforming items found.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-3">
              <TrendingUp className="h-4 w-4" /> Star Performance Demo Items
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {starItems.length > 0 ? (
                starItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {item.name}
                  </li>
                ))
              ) : (
                <li>No star items found.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/30 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Execute a Swap</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item to Swap Out
              </label>
              <Select
                value={selectedUnder}
                onChange={(e) => setSelectedUnder(e.target.value)}
              >
                {underperformingItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            <ArrowRightLeft className="h-6 w-6 text-muted-foreground shrink-0 mt-6 hidden md:block" />

            <div className="flex-1 w-full">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item to Swap In
              </label>
              <Select
                value={selectedStar}
                onChange={(e) => setSelectedStar(e.target.value)}
              >
                {starItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <PrimaryButton
            onClick={handleSwap}
            disabled={!selectedUnder || !selectedStar}
            className="w-full mt-2"
          >
            Confirm Swap
          </PrimaryButton>
        </div>

        {swapHistory.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Demo Swaps</h3>
            <div className="space-y-2">
              {swapHistory.map((swap, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3 text-sm">
                  <div className="flex items-center gap-2 text-rose-400">
                    <span className="font-medium line-through">{swap.under}</span>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-amber-400">
                    <span className="font-medium">{swap.star}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
