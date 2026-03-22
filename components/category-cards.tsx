"use client"

import { useState, useMemo } from "react"
import { useFinance, type CategoryDefinition } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { AddCategoryModal } from "./add-category-modal"
import { CategoryDetailModal } from "./category-detail-modal"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function CategoryCards() {
  const { categoryTotals, revenueTotals, getCategoriesByType } = useFinance()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDefinition | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])

  const expensesWithTotals = useMemo(() => {
    return expenseCategories
      .map(cat => ({ ...cat, total: categoryTotals[cat.id] || 0 }))
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [expenseCategories, categoryTotals])

  const revenuesWithTotals = useMemo(() => {
    return revenueCategories
      .map(cat => ({ ...cat, total: revenueTotals[cat.id] || 0 }))
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [revenueCategories, revenueTotals])

  const handleCategoryClick = (cat: CategoryDefinition) => {
    setSelectedCategory(cat)
    setDetailModalOpen(true)
  }

  const hasAny = expensesWithTotals.length > 0 || revenuesWithTotals.length > 0

  return (
    <>
      <div className="bg-card rounded-lg border border-border p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Categorias</h2>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>

        {!hasAny ? (
          <p className="text-muted-foreground text-sm text-center py-6">
            Nenhuma transação registrada ainda
          </p>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
            {/* Expenses Section */}
            {expensesWithTotals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingDown className="w-3 h-3 text-danger" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Despesas</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {expensesWithTotals.map(cat => {
                    const exceeded = cat.budget !== undefined && cat.total > cat.budget
                    const percent = cat.budget ? Math.min((cat.total / cat.budget) * 100, 100) : 0

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            {exceeded && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-danger-muted text-danger">
                                Excedido
                              </span>
                            )}
                            <span className={cn("text-xs font-semibold", exceeded ? "text-danger" : "text-foreground")}>
                              {formatCurrency(cat.total)}
                            </span>
                          </div>
                        </div>
                        {cat.budget && (
                          <>
                            <div className="w-full bg-background rounded-full h-1 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  exceeded ? "bg-danger" : "bg-primary"
                                )}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Limite: {formatCurrency(cat.budget)}
                            </p>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Revenue Section */}
            {revenuesWithTotals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Receitas</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {revenuesWithTotals.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className="w-full text-left p-2 rounded-lg bg-success-muted/30 hover:bg-success-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{cat.name}</span>
                        <span className="text-xs font-semibold text-success">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      <AddCategoryModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <CategoryDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        category={selectedCategory}
      />
    </>
  )
}
