"use client"

import { useMemo } from "react"
import { useFinance, type CategoryDefinition } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { X, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CategoryDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryDefinition | null
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function CategoryDetailModal({ open, onOpenChange, category }: CategoryDetailModalProps) {
  const { filteredTransactions } = useFinance()

  const transactions = useMemo(() => {
    if (!category) return []
    return filteredTransactions
      .filter(t => t.categoryId === category.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filteredTransactions, category])

  const total = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  if (!category) return null

  const isExpense = category.type === "expense"
  const budget = category.budget
  const exceeded = budget !== undefined && total > budget
  const percent = budget ? Math.min((total / budget) * 100, 100) : 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 focus:outline-none max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isExpense ? "bg-danger-muted" : "bg-success-muted"
              )}>
                {isExpense ? (
                  <TrendingDown className={cn("w-5 h-5", "text-danger")} />
                ) : (
                  <TrendingUp className={cn("w-5 h-5", "text-success")} />
                )}
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {category.name}
                </Dialog.Title>
                <p className="text-xs text-muted-foreground">
                  {isExpense ? "Despesas" : "Receitas"} — {transactions.length} transações
                </p>
              </div>
            </div>
            <Dialog.Close className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Detalhes da categoria {category.name}</Dialog.Description>

          {/* Summary */}
          <div className={cn(
            "rounded-xl p-4 mb-4",
            isExpense ? "bg-danger-muted/50" : "bg-success-muted/50"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {isExpense ? "Total Gasto" : "Total Recebido"}
              </span>
              <span className={cn(
                "text-xl font-bold",
                isExpense ? (exceeded ? "text-danger" : "text-foreground") : "text-success"
              )}>
                {formatCurrency(total)}
              </span>
            </div>
            {budget && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Limite: {formatCurrency(budget)}</span>
                  {exceeded && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-danger text-danger-foreground">
                      Excedido em {formatCurrency(total - budget)}
                    </span>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      exceeded ? "bg-danger" : "bg-primary"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nenhuma transação nesta categoria</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {transactions.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t.description || "Sem descrição"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(t.date), "dd MMM yyyy", { locale: ptBR })} — {t.type}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold shrink-0 ml-3",
                      isExpense ? "text-danger" : "text-success"
                    )}>
                      {isExpense ? "-" : "+"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
