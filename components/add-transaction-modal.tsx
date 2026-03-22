"use client"

import { useState, useMemo } from "react"
import { useFinance, type TransactionType } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { X, ChevronDown, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import * as Dialog from "@radix-ui/react-dialog"

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const { addTransaction, getCategoriesByType } = useFinance()

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])

  const today = format(new Date(), "yyyy-MM-dd")

  const [isRevenue, setIsRevenue] = useState(false)
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || "")
  const [amount, setAmount] = useState("")
  const [useToday, setUseToday] = useState(true)
  const [date, setDate] = useState(today)
  const [type, setType] = useState<TransactionType>("PJ")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  // Update category when switching type
  const handleTypeToggle = (rev: boolean) => {
    setIsRevenue(rev)
    if (rev && revenueCategories.length > 0) {
      setCategoryId(revenueCategories[0].id)
    } else if (!rev && expenseCategories.length > 0) {
      setCategoryId(expenseCategories[0].id)
    }
  }

  const currentCategories = isRevenue ? revenueCategories : expenseCategories

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9,]/g, "")
    setAmount(raw)
  }

  const parseAmount = () => {
    return parseFloat(amount.replace(",", ".")) || 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseAmount()
    if (!parsed || parsed <= 0) {
      setError("Informe um valor válido")
      return
    }
    if (!categoryId) {
      setError("Selecione uma categoria")
      return
    }
    setError("")
    addTransaction({
      categoryId,
      amount: parsed,
      date: useToday ? today : date,
      type,
      description: description.trim() || undefined,
    })
    // Reset
    setAmount("")
    setDescription("")
    setCategoryId(expenseCategories[0]?.id || "")
    setUseToday(true)
    setDate(today)
    setType("PJ")
    setIsRevenue(false)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 focus:outline-none"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Nova Transação
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Formulário para adicionar uma nova transação financeira</Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Revenue / Expense Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border">
              <button
                type="button"
                onClick={() => handleTypeToggle(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                  !isRevenue ? "bg-danger text-danger-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                <TrendingDown className="w-4 h-4" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => handleTypeToggle(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                  isRevenue ? "bg-success text-success-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Receita
              </button>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoria</label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer"
                >
                  {currentCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={handleAmountChange}
                  className={cn(
                    "w-full bg-muted border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                    error ? "border-danger" : "border-border"
                  )}
                />
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data</label>
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2.5 border border-border">
                <span className="text-sm text-muted-foreground">Usar data de hoje</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useToday}
                  onClick={() => setUseToday(v => !v)}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                    useToday ? "bg-primary" : "bg-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                      useToday ? "left-5" : "left-0.5"
                    )}
                  />
                </button>
              </div>
              {!useToday && (
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  max={today}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              )}
            </div>

            {/* Type PF / PJ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Origem</label>
              <div className="flex rounded-xl overflow-hidden border border-border">
                {(["PF", "PJ"] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 py-2.5 text-sm font-semibold transition-colors",
                      type === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {t === "PF" ? "PF — Pessoal" : "PJ — Empresarial"}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Descrição <span className="normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Pagamento fornecedor, Venda loja..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Salvar {isRevenue ? "Receita" : "Despesa"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function AddTransactionFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Adicionar transação"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-semibold">Adicionar</span>
    </button>
  )
}
