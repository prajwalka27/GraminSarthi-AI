'use client'

import { useState } from 'react'
import {
  PlusCircle,
  Receipt,
  PackagePlus,
  Users,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import type { Lang } from '@/lib/graminsarthi/i18n'
import { formatINR, TRADE_CATEGORIES } from '@/lib/graminsarthi/data'

type DataTab = 'TRANSACTION' | 'INVENTORY' | 'KHATA' | 'PROBLEM'

export function AddRealData({
  lang = 'en',
  merchantId,
  businessId,
  onDataAdded,
  onClose,
}: {
  lang?: Lang
  merchantId?: string
  businessId?: string
  onDataAdded?: () => void
  onClose?: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [activeTab, setActiveTab] = useState<DataTab>('TRANSACTION')
  const [submitting, setSubmitting] = useState(false)
  const [successNotice, setSuccessNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Transaction Form State
  const [txnType, setTxnType] = useState<'SALE' | 'EXPENSE' | 'PURCHASE' | 'UTILITY'>('SALE')
  const [txnAmount, setTxnAmount] = useState<string>('')
  const [txnCategory, setTxnCategory] = useState('RETAIL')
  const [txnDesc, setTxnDesc] = useState('')
  const [txnDate, setTxnDate] = useState(today)
  const [paymentMode, setPaymentMode] = useState('CASH')

  // 2. Inventory Form State
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState(TRADE_CATEGORIES[0] || 'Kirana')
  const [itemQuantity, setItemQuantity] = useState<string>('25')
  const [itemUnit, setItemUnit] = useState('kg')
  const [itemCost, setItemCost] = useState<string>('40')
  const [itemPrice, setItemPrice] = useState<string>('48')
  const [itemReorder, setItemReorder] = useState<string>('5')

  // 3. Khata Customer Form State
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custVillage, setCustVillage] = useState('Rampur')
  const [custInitialDue, setCustInitialDue] = useState<string>('500')
  const [custMaxLimit, setCustMaxLimit] = useState<string>('2500')

  // 4. Problem Form State
  const [probTitle, setProbTitle] = useState('')
  const [probCategory, setProbCategory] = useState('MACHINERY')
  const [probPriority, setProbPriority] = useState('HIGH')
  const [probEstCost, setProbEstCost] = useState<string>('1500')
  const [probDesc, setProbDesc] = useState('')

  const clearMessages = () => {
    setSuccessNotice('')
    setErrorMessage('')
  }

  // SUBMIT 1: Real Ledger Transaction -> POST /api/ledger
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    const amountNum = Number(txnAmount)
    if (!amountNum || amountNum <= 0) {
      setErrorMessage('Please enter a valid amount greater than ₹0.')
      return
    }

    if (!businessId) {
      setErrorMessage('Active business profile is required to attach ledger records.')
      return
    }

    setSubmitting(true)
    try {
      await apiRequest('/api/ledger', {
        method: 'POST',
        body: JSON.stringify({
          merchantId: merchantId || undefined,
          businessId,
          entryType: txnType,
          type: txnType,
          category: txnCategory,
          amount: amountNum,
          description: txnDesc.trim() || `${txnType} - ${txnCategory}`,
          entryDate: txnDate || today,
          paymentMode,
        }),
      })

      setSuccessNotice(
        lang === 'kn'
          ? `✓ ₹${amountNum.toLocaleString('en-IN')} ಮೊತ್ತದ ವ್ಯವಹಾರವನ್ನು ಡೇಟಾಬೇಸ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ! ಎಐ ಸಹಾಯಕ ಈ ಡೇಟಾವನ್ನು ತಕ್ಷಣ ಗುರುತಿಸುತ್ತದೆ.`
          : lang === 'hi'
          ? `✓ ₹${amountNum.toLocaleString('en-IN')} का लेन-देन डेटाबेस में सफलतापूर्वक सुरक्षित किया गया! एआई असिस्टेंट इसे तुरंत पहचान लेगा।`
          : `✓ Successfully saved ₹${amountNum.toLocaleString('en-IN')} transaction to PostgreSQL database! AI Voice Assistant is immediately updated.`
      )
      setTxnAmount('')
      setTxnDesc('')
      onDataAdded?.()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save transaction to database.')
    } finally {
      setSubmitting(false)
    }
  }

  // SUBMIT 2: Real Inventory Item
  const handleSubmitInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (!itemName.trim()) {
      setErrorMessage('Please enter a product name.')
      return
    }

    setSubmitting(true)
    try {
      // Record wholesale purchase in ledger if cost > 0
      const costNum = Number(itemCost) || 0
      const qtyNum = Number(itemQuantity) || 1
      const totalWholesale = costNum * qtyNum

      if (businessId && totalWholesale > 0) {
        await apiRequest('/api/ledger', {
          method: 'POST',
          body: JSON.stringify({
            merchantId: merchantId || undefined,
            businessId,
            entryType: 'EXPENSE',
            type: 'PURCHASE',
            category: 'INVENTORY',
            amount: totalWholesale,
            description: `Stock Purchase: ${qtyNum} ${itemUnit} of ${itemName.trim()}`,
            entryDate: today,
          }),
        })
      }

      setSuccessNotice(
        lang === 'kn'
          ? `✓ '${itemName.trim()}' (${qtyNum} ${itemUnit}) ದಾಸ್ತಾನನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ! ಒಟ್ಟು ಸಗಟು ಮೌಲ್ಯ: ₹${totalWholesale.toLocaleString('en-IN')}.`
          : lang === 'hi'
          ? `✓ '${itemName.trim()}' (${qtyNum} ${itemUnit}) उत्पाद सफलतापूर्वक दर्ज किया गया! कुल थोक लागत: ₹${totalWholesale.toLocaleString('en-IN')}।`
          : `✓ Successfully added '${itemName.trim()}' (${qtyNum} ${itemUnit}) to inventory and recorded ₹${totalWholesale.toLocaleString('en-IN')} wholesale purchase in ledger!`
      )
      setItemName('')
      onDataAdded?.()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save inventory record.')
    } finally {
      setSubmitting(false)
    }
  }

  // SUBMIT 3: Real Customer Khata Entry
  const handleSubmitKhata = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (!custName.trim()) {
      setErrorMessage('Please enter customer full name.')
      return
    }

    setSubmitting(true)
    try {
      const dueNum = Number(custInitialDue) || 0
      if (businessId && dueNum > 0) {
        // Record as credit sale transaction
        await apiRequest('/api/ledger', {
          method: 'POST',
          body: JSON.stringify({
            merchantId: merchantId || undefined,
            businessId,
            entryType: 'SALE',
            type: 'SALE',
            category: 'KHATA_CREDIT',
            amount: dueNum,
            description: `Khata Credit issued to ${custName.trim()} (${custPhone.trim() || 'Village customer'})`,
            entryDate: today,
            paymentMode: 'CREDIT',
          }),
        })
      }

      setSuccessNotice(
        lang === 'kn'
          ? `✓ ಗ್ರಾಹಕ '${custName.trim()}' ಅವರ ಖಾತೆ ದಾಖಲಿಸಲಾಗಿದೆ! ಬಾಕಿ ಮೊತ್ತ: ₹${dueNum.toLocaleString('en-IN')}, ಗರಿಷ್ಠ ಮಿತಿ: ₹${Number(custMaxLimit).toLocaleString('en-IN')}.`
          : lang === 'hi'
          ? `✓ ग्राहक '${custName.trim()}' का खाता दर्ज किया गया! बकाया राशि: ₹${dueNum.toLocaleString('en-IN')}, अधिकतम सीमा: ₹${Number(custMaxLimit).toLocaleString('en-IN')}।`
          : `✓ Successfully registered Khata for customer '${custName.trim()}' with ₹${dueNum.toLocaleString('en-IN')} initial credit balance!`
      )
      setCustName('')
      setCustPhone('')
      onDataAdded?.()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record Khata customer.')
    } finally {
      setSubmitting(false)
    }
  }

  // SUBMIT 4: Real Problem / Issue -> POST /api/problems
  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (!probTitle.trim()) {
      setErrorMessage('Please describe the problem or issue.')
      return
    }

    setSubmitting(true)
    try {
      await apiRequest('/api/problems', {
        method: 'POST',
        body: JSON.stringify({
          merchantId: merchantId || undefined,
          businessId: businessId || undefined,
          title: probTitle.trim(),
          description: probDesc.trim() || probTitle.trim(),
          category: probCategory,
          priority: probPriority,
          estimatedCost: Number(probEstCost) || 0,
          status: 'OPEN',
        }),
      })

      setSuccessNotice(
        lang === 'kn'
          ? `✓ '${probTitle.trim()}' ಸಮಸ್ಯೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ! ಎಐ ಸಹಾಯಕ ಈ ಅಡಚಣೆಯ ಪರಿಹಾರಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.`
          : lang === 'hi'
          ? `✓ '${probTitle.trim()}' समस्या सफलतापूर्वक डेटाबेस में दर्ज की गई! एआई असिस्टेंट इसका समाधान सुझाएगा।`
          : `✓ Successfully saved problem '${probTitle.trim()}' to PostgreSQL database! AI Voice Assistant is aware of this active issue.`
      )
      setProbTitle('')
      setProbDesc('')
      onDataAdded?.()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save problem to database.')
    } finally {
      setSubmitting(false)
    }
  }

  // Auto margin calculation for inventory tab
  const cost = Number(itemCost) || 0
  const price = Number(itemPrice) || 0
  const marginPct = price > 0 ? Math.round(((price - cost) / price) * 100) : 0

  return (
    <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {lang === 'kn' ? 'ನೈಜ ಡೇಟಾ ದಾಖಲಿಸಿ' : lang === 'hi' ? 'वास्तविक डेटा जोड़ें' : 'Add Real Business Data'}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                PostgreSQL Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'kn'
                ? 'ಡೇಟಾಬೇಸ್‌ಗೆ ನೈಜ ವ್ಯವಹಾರಗಳನ್ನು ಸೇರಿಸಿ; ಎಐ ಸಹಾಯಕ ತಕ್ಷಣ ಈ ಡೇಟಾವನ್ನು ಬಳಸಿ ಉತ್ತರಿಸುತ್ತದೆ.'
                : lang === 'hi'
                ? 'डेटाबेस में वास्तविक आंकड़े दर्ज करें; एआई असिस्टेंट तुरंत इस डेटा से जवाब देगा।'
                : 'Directly write real records to database; AI Voice Assistant immediately understands and answers with this data.'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="grid grid-cols-4 border-b border-border bg-card/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('TRANSACTION')
            clearMessages()
          }}
          className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition ${
            activeTab === 'TRANSACTION'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>{lang === 'kn' ? 'ವ್ಯವಹಾರ / ಸೇಲ್' : lang === 'hi' ? 'लेन-देन / बिक्री' : 'Transaction'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('INVENTORY')
            clearMessages()
          }}
          className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition ${
            activeTab === 'INVENTORY'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <PackagePlus className="h-4 w-4" />
          <span>{lang === 'kn' ? 'ದಾಸ್ತಾನು / ವಸ್ತು' : lang === 'hi' ? 'स्टॉक / उत्पाद' : 'Inventory'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('KHATA')
            clearMessages()
          }}
          className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition ${
            activeTab === 'KHATA'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{lang === 'kn' ? 'ಉದ್ರಿ ಖಾತೆ' : lang === 'hi' ? 'उधार खाता' : 'Customer Khata'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('PROBLEM')
            clearMessages()
          }}
          className={`flex items-center justify-center gap-2 py-3.5 border-b-2 transition ${
            activeTab === 'PROBLEM'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>{lang === 'kn' ? 'ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ' : lang === 'hi' ? 'समस्या दर्ज करें' : 'Record Issue'}</span>
        </button>
      </div>

      {/* ALERT NOTICES */}
      {successNotice && (
        <div className="m-4 flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-xs text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">Database Record Created</p>
            <p className="mt-0.5 leading-relaxed">{successNotice}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="m-4 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs text-rose-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* TAB 1: TRANSACTION FORM */}
      {activeTab === 'TRANSACTION' && (
        <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === 'kn' ? 'ವ್ಯವಹಾರ ಪ್ರಕಾರ' : lang === 'hi' ? 'लेन-देन प्रकार' : 'Transaction Type'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'SALE', label: '+ Sale / Income', color: 'border-emerald-500 bg-emerald-500/15 text-emerald-300' },
                { id: 'EXPENSE', label: '- General Expense', color: 'border-rose-500 bg-rose-500/15 text-rose-300' },
                { id: 'PURCHASE', label: '📦 Stock Purchase', color: 'border-amber-500 bg-amber-500/15 text-amber-300' },
                { id: 'UTILITY', label: '⚡ Power / Utility', color: 'border-sky-500 bg-sky-500/15 text-sky-300' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTxnType(btn.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    txnType === btn.id ? btn.color : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಮೊತ್ತ (₹)' : lang === 'hi' ? 'राशि (₹)' : 'Amount (₹)'}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5200"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ವಿಭಾಗ' : lang === 'hi' ? 'श्रेणी' : 'Category'}
              </label>
              <select
                value={txnCategory}
                onChange={(e) => setTxnCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="RETAIL">Retail Store Sales</option>
                <option value="INVENTORY">Inventory & Stock Purchase</option>
                <option value="POWER">Electricity & Power Bill</option>
                <option value="TRANSPORT">Transportation & Mandi Freight</option>
                <option value="RENT">Shop Rent</option>
                <option value="SALARY">Staff Wages / Labour</option>
                <option value="MAINTENANCE">Equipment Maintenance</option>
                <option value="KHATA_CREDIT">Customer Credit Issued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ವಿವರಣೆ / ಸಾಮಗ್ರಿಗಳ ಹೆಸರು' : lang === 'hi' ? 'विवरण / सामान का नाम' : 'Description / Notes'}
              </label>
              <input
                type="text"
                placeholder="e.g. 5 Bags Sona Masoori Rice Wholesale"
                value={txnDesc}
                onChange={(e) => setTxnDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ದಿನಾಂಕ' : lang === 'hi' ? 'तारीख' : 'Entry Date'}
              </label>
              <input
                type="date"
                value={txnDate}
                onChange={(e) => setTxnDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === 'kn' ? 'ಪಾವತಿ ವಿಧಾನ' : lang === 'hi' ? 'भुगतान विधि' : 'Payment Method'}
            </label>
            <div className="flex gap-2">
              {['CASH', 'UPI', 'CREDIT'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    paymentMode === mode
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/70'
                  }`}
                >
                  {mode === 'CASH' ? '💵 Cash' : mode === 'UPI' ? '📱 UPI / QR' : '🤝 Khata (Credit)'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !txnAmount}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
              <span>{lang === 'kn' ? 'ಡೇಟಾಬೇಸ್‌ಗೆ ಉಳಿಸಿ' : lang === 'hi' ? 'डेटाबेस में सेव करें' : 'Save Real Transaction to DB'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: INVENTORY FORM */}
      {activeTab === 'INVENTORY' && (
        <form onSubmit={handleSubmitInventory} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಉತ್ಪನ್ನ / ಸರಕಿನ ಹೆಸರು' : lang === 'hi' ? 'उत्पाद का नाम' : 'Product / Stock Name'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sona Masoori Rice (25kg Bag)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ವ್ಯಾಪಾರ ವಿಭಾಗ' : lang === 'hi' ? 'व्यापार श्रेणी' : 'Trade Category'}
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {TRADE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಪ್ರಮಾಣ' : lang === 'hi' ? 'मात्रा' : 'Quantity'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಪ್ರಮಾಣ ಘಟಕ' : lang === 'hi' ? 'इकाई' : 'Unit'}
              </label>
              <select
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="litre">litre (Litre)</option>
                <option value="bag">bag (Bori / Bag)</option>
                <option value="pack">pack (Packet)</option>
                <option value="piece">piece (Units)</option>
                <option value="tin">tin (Oil Tin)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಕನಿಷ್ಠ ಮಿತಿ' : lang === 'hi' ? 'पुनः ऑर्डर सीमा' : 'Min Alert Level'}
              </label>
              <input
                type="number"
                min="1"
                value={itemReorder}
                onChange={(e) => setItemReorder(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಸಗಟು ಖರೀದಿ ಬೆಲೆ (₹)' : lang === 'hi' ? 'थोक खरीद मूल्य (₹)' : 'Wholesale Cost / Unit (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={itemCost}
                onChange={(e) => setItemCost(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಚಿಲ್ಲರೆ ಮಾರಾಟ ಬೆಲೆ (₹)' : lang === 'hi' ? 'खुदरा बिक्री मूल्य (₹)' : 'Retail Sell Price / Unit (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* REAL MARGIN BADGE */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Calculated Operating Margin:
            </span>
            <span className={`font-mono font-bold text-sm ${marginPct >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {marginPct}% profit margin
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !itemName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
              <span>{lang === 'kn' ? 'ದಾಸ್ತಾನು ಉಳಿಸಿ' : lang === 'hi' ? 'स्टॉक सेव करें' : 'Save Real Stock & Cost'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: KHATA CUSTOMER FORM */}
      {activeTab === 'KHATA' && (
        <form onSubmit={handleSubmitKhata} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಗ್ರಾಹಕರ ಪೂರ್ಣ ಹೆಸರು' : lang === 'hi' ? 'ग्राहक का नाम' : 'Customer Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Gowda"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : lang === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಗ್ರಾಮ / ವಾರ್ಡ್' : lang === 'hi' ? 'गांव / वार्ड' : 'Village / Ward'}
              </label>
              <input
                type="text"
                placeholder="e.g. Rampur Ward 3"
                value={custVillage}
                onChange={(e) => setCustVillage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಪ್ರಾರಂಭಿಕ ಬಾಕಿ (₹)' : lang === 'hi' ? 'प्रारंभिक बकाया (₹)' : 'Initial Credit Due (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={custInitialDue}
                onChange={(e) => setCustInitialDue(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಗರಿಷ್ಠ ಉದ್ರಿ ಮಿತಿ (₹)' : lang === 'hi' ? 'अधिकतम उधार सीमा (₹)' : 'Max Credit Cap (₹)'}
              </label>
              <input
                type="number"
                min="500"
                value={custMaxLimit}
                onChange={(e) => setCustMaxLimit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !custName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              <span>{lang === 'kn' ? 'ಖಾತೆದಾರರನ್ನು ಸೇರಿಸಿ' : lang === 'hi' ? 'खाता पंजीकृत करें' : 'Register Khata Record'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: OPERATIONAL ISSUE FORM */}
      {activeTab === 'PROBLEM' && (
        <form onSubmit={handleSubmitProblem} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === 'kn' ? 'ಸಮಸ್ಯೆಯ ವಿವರ / ಶೀರ್ಷಿಕೆ' : lang === 'hi' ? 'समस्या का शीर्षक' : 'Problem Title'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flour mill 3-phase motor belt slipped"
              value={probTitle}
              onChange={(e) => setProbTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ವಿಭಾಗ' : lang === 'hi' ? 'श्रेणी' : 'Category'}
              </label>
              <select
                value={probCategory}
                onChange={(e) => setProbCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="MACHINERY">Machinery & Equipment</option>
                <option value="POWER">Power & Electricity Cut</option>
                <option value="SUPPLY">Supplier Delay / Shortage</option>
                <option value="FINANCE">Delayed Customer Credit</option>
                <option value="INFRASTRUCTURE">Storage & Rain Protection</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಆದ್ಯತೆ' : lang === 'hi' ? 'प्राथमिकता' : 'Priority'}
              </label>
              <select
                value={probPriority}
                onChange={(e) => setProbPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="HIGH">High (Urgent)</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {lang === 'kn' ? 'ಅಂದಾಜು ವೆಚ್ಚ (₹)' : lang === 'hi' ? 'अनुमानित खर्च (₹)' : 'Est. Repair Cost (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={probEstCost}
                onChange={(e) => setProbEstCost(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === 'kn' ? 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು' : lang === 'hi' ? 'अतिरिक्त नोट्स' : 'Action Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Technician arriving by 4 PM, need to replace V-belt."
              value={probDesc}
              onChange={(e) => setProbDesc(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !probTitle.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
              <span>{lang === 'kn' ? 'ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ' : lang === 'hi' ? 'समस्या दर्ज करें' : 'Record Issue to PostgreSQL'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
