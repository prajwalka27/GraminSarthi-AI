'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  X,
  MapPin,
  Tag,
  ShieldAlert,
  ChevronRight
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lang } from '@/lib/graminsarthi/i18n'

export interface ProblemItem {
  id: string
  merchantId?: string | null
  businessId?: string | null
  title: string
  description?: string | null
  category?: string | null
  location?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

export function ProblemsCard({
  lang,
  merchantId,
  businessId,
}: {
  lang: Lang
  merchantId?: string
  businessId?: string
}) {
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New problem form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Equipment')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const fetchProblems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let query = '/api/problems'
      const params = new URLSearchParams()
      if (merchantId) params.append('merchantId', merchantId)
      if (businessId) params.append('businessId', businessId)
      if (params.toString()) query += `?${params.toString()}`

      const res = await apiRequest<{ success: boolean; data: ProblemItem[] }>(query)
      if (res && Array.isArray(res.data)) {
        setProblems(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load problems from backend:', err)
      setError(err?.message || 'Failed to load problems from database')
    } finally {
      setLoading(false)
    }
  }, [merchantId, businessId])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')

    try {
      await apiRequest('/api/problems', {
        method: 'POST',
        body: JSON.stringify({
          merchantId,
          businessId,
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          location: location.trim() || undefined,
          priority,
          status: 'open'
        })
      })

      setTitle('')
      setDescription('')
      setLocation('')
      setPriority('medium')
      setShowAddModal(false)
      await fetchProblems()
    } catch (err: any) {
      setError(err?.message || 'Failed to report problem')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: ProblemItem['status']) => {
    try {
      await apiRequest(`/api/problems/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
      await fetchProblems()
    } catch (err: any) {
      setError(err?.message || 'Failed to update problem status')
    }
  }

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem record?')) return
    try {
      await apiRequest(`/api/problems/${id}`, {
        method: 'DELETE'
      })
      await fetchProblems()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete problem')
    }
  }

  const filtered = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' || p.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              {lang === 'hi' ? 'व्यापारिक समस्याएं व शिकायतें' : 'Business Problems & Issues'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === 'hi'
              ? 'दुकान की समस्याओं को सीधे पोस्टग्रेएसक्यूएल डेटाबेस में दर्ज करें'
              : 'Real operational issues recorded and managed directly in PostgreSQL'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProblems}
            disabled={loading}
            className="rounded-xl border border-border bg-secondary p-2 text-muted-foreground hover:text-foreground transition"
            title="Refresh problems from database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>{lang === 'hi' ? '+ समस्या दर्ज करें' : '+ Report Issue'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={lang === 'hi' ? 'खोजें...' : 'Search issues...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                selectedStatus === s.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div className="mt-4 space-y-3">
        {loading && problems.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-emerald-400 mb-2" />
            Fetching issues from PostgreSQL...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-secondary/50 p-8 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
            {searchQuery || selectedStatus !== 'all'
              ? 'No issues match your current filters.'
              : 'No open operational issues recorded for this store! Everything is running smoothly.'}
          </div>
        ) : (
          filtered.map(p => (
            <div
              key={p.id}
              className="rounded-2xl border border-border bg-secondary/40 p-4 transition hover:border-emerald-500/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      p.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-sky-500/20 text-sky-300'
                    }`}>
                      {p.priority} Priority
                    </span>

                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      p.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                      p.status === 'in_progress' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>

                    {p.category && (
                      <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-foreground sm:text-base">
                    {p.title}
                  </h3>

                  {p.description && (
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  {p.location && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      <span>{p.location}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {p.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'resolved')}
                      className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition"
                      title="Mark resolved in database"
                    >
                      ✓ Resolve
                    </button>
                  )}
                  {p.status === 'open' && (
                    <button
                      onClick={() => handleUpdateStatus(p.id, 'in_progress')}
                      className="rounded-xl bg-purple-600/20 border border-purple-500/30 px-2.5 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-600/30 transition"
                      title="Mark in progress"
                    >
                      In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProblem(p.id)}
                    className="rounded-xl p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete record from database"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Report Operational Issue</h3>
                  <p className="text-[11px] text-muted-foreground">Persists directly into PostgreSQL</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProblem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grain weighing scale error, Milk chiller breakdown"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details of the problem, impact on daily sales or inventory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  >
                    <option value="Equipment">Equipment / Machinery</option>
                    <option value="Supply Chain">Wholesale Supply Delay</option>
                    <option value="Infrastructure">Power / Infrastructure</option>
                    <option value="Inventory">Spoilage / Perishables</option>
                    <option value="Finance">Cash Flow / Banking</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Counter 1, Cold Storage, Mandi Road"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Saving to Database...' : 'Save Issue to Database'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
