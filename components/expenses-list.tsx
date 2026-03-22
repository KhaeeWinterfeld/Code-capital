"use client"

import { useState, useMemo } from "react"
import { useFinance, type Transaction } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Search, SlidersHorizontal, ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

type SortField = "date" | "amount"
type SortDir = "asc" | "desc"
type ViewMode = "expenses" | "revenue" | "all"

export function ExpensesList() {
  const { filteredTransactions, getCategoriesByType, getCategoryById } = useFinance()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("all")

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])

  const expenseCategoryIds = new Set(expenseCategories.map(c => c.id))
  const revenueCategoryIds = new Set(revenueCategories.map(c => c.id))

  const sorted = useMemo(() => {
    let list = [...filteredTransactions]
    
    // Filter by view mode
    if (viewMode === "expenses") {
      list = list.filter(t => expenseCategoryIds.has(t.categoryId))
    } else if (viewMode === "revenue") {
      list = list.filter(t => revenueCategoryIds.has(t.categoryId))
    }
    
    // Filter by category
    if (categoryFilter !== "all") {
      list = list.filter(t => t.categoryId === categoryFilter)
    }
    
    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => {
        const cat = getCategoryById(t.categoryId)
        return (
          t.description?.toLowerCase().includes(q) ||
          cat?.name.toLowerCase().includes(q)
        )
      })
    }
    
    // Sort
    list.sort((a, b) => {
      if (sortField === "date") {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
        return sortDir === "asc" ? diff : -diff
      } else {
        const diff = a.amount - b.amount
        return sortDir === "asc" ? diff : -diff
      }
    })
    return list
  }, [filteredTransactions, categoryFilter, search, sortField, sortDir, viewMode, getCategoryById, expenseCategoryIds, revenueCategoryIds])

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("desc") }
  }

  const availableCategories = viewMode === "expenses" 
    ? expenseCategories 
    : viewMode === "revenue" 
      ? revenueCategories 
      : [...expenseCategories, ...revenueCategories]

  return (
    <div className="flex flex-col gap-4">
      {/* View Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden border border-border w-fit">
        <button
          type="button"
          onClick={() => { setViewMode("all"); setCategoryFilter("all") }}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            viewMode === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => { setViewMode("expenses"); setCategoryFilter("all") }}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
            viewMode === "expenses" ? "bg-danger text-danger-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          Despesas
        </button>
        <button
          type="button"
          onClick={() => { setViewMode("revenue"); setCategoryFilter("all") }}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5",
            viewMode === "revenue" ? "bg-success text-success-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Receitas
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar transações..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
            showFilters
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            )}
          >
            Todas
          </button>
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                categoryFilter === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{sorted.length} {sorted.length === 1 ? "transação" : "transações"}</span>
        <div className="ml-auto flex items-center gap-1">
          <span>Ordenar:</span>
          {(["date", "amount"] as SortField[]).map(f => (
            <button
              key={f}
              onClick={() => toggleSort(f)}
              className={cn(
                "flex items-center gap-0.5 px-2 py-1 rounded-md transition-colors",
                sortField === f ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}
            >
              {f === "date" ? "Data" : "Valor"}
              <ArrowUpDown className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {sorted.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
          <p className="text-muted-foreground text-xs mt-1">Tente ajustar os filtros ou adicione uma nova transação</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {sorted.map((t, i) => (
            <TransactionItem 
              key={t.id} 
              transaction={t} 
              isLast={i === sorted.length - 1} 
              isExpense={expenseCategoryIds.has(t.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TransactionItem({ 
  transaction: t, 
  isLast, 
  isExpense 
}: { 
  transaction: Transaction
  isLast: boolean
  isExpense: boolean
}) {
  const { getCategoryById } = useFinance()
  const category = getCategoryById(t.categoryId)

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors", !isLast && "border-b border-border")}>
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
        isExpense ? "bg-danger-muted" : "bg-success-muted"
      )}>
        {isExpense ? (
          <TrendingDown className="w-4 h-4 text-danger" />
        ) : (
          <TrendingUp className="w-4 h-4 text-success" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {t.description || category?.name || "Sem descrição"}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(parseISO(t.date), "d 'de' MMM, yyyy", { locale: ptBR })}
          {category && ` · ${category.name}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "text-xs font-semibold px-2 py-0.5 rounded-full border",
          t.type === "PF"
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-warning/10 text-warning-foreground border-warning/20"
        )}>
          {t.type}
        </span>
        <span className={cn(
          "text-sm font-semibold",
          isExpense ? "text-danger" : "text-success"
        )}>
          {isExpense ? "-" : "+"}{formatCurrency(t.amount)}
        </span>
      </div>
    </div>
  )
}
