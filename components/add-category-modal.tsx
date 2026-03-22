"use client"

import { useState } from "react"
import { useFinance, type CategoryType } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"

interface AddCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCategoryModal({ open, onOpenChange }: AddCategoryModalProps) {
  const { addCategory, categories } = useFinance()

  const [name, setName] = useState("")
  const [type, setType] = useState<CategoryType>("expense")
  const [budget, setBudget] = useState("")
  const [error, setError] = useState("")

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9,]/g, "")
    setBudget(raw)
  }

  const parseBudget = () => {
    if (!budget) return undefined
    return parseFloat(budget.replace(",", ".")) || undefined
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    
    if (!trimmedName) {
      setError("Informe um nome para a categoria")
      return
    }

    const exists = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.type === type
    )
    if (exists) {
      setError("Já existe uma categoria com esse nome")
      return
    }

    setError("")
    addCategory(trimmedName, type, parseBudget())
    
    // Reset
    setName("")
    setBudget("")
    setType("expense")
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
              Nova Categoria
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Formulário para criar uma nova categoria</Dialog.Description>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Type Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</label>
              <div className="flex rounded-xl overflow-hidden border border-border">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                    type === "expense" ? "bg-danger text-danger-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  <TrendingDown className="w-4 h-4" />
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType("revenue")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors",
                    type === "revenue" ? "bg-success text-success-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  Receita
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome</label>
              <input
                type="text"
                placeholder="Ex: Marketing Digital"
                value={name}
                onChange={e => setName(e.target.value)}
                className={cn(
                  "w-full bg-muted border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all",
                  error ? "border-danger" : "border-border"
                )}
              />
              {error && <p className="text-xs text-danger">{error}</p>}
            </div>

            {/* Budget (only for expenses) */}
            {type === "expense" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Limite Mensal <span className="normal-case">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={budget}
                    onChange={handleBudgetChange}
                    className="w-full bg-muted border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Criar Categoria
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
