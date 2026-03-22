"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { api, type BackendCategory, type BackendService, type BackendTransaction } from "./api"

export type TransactionType = "PF" | "PJ"
export type CategoryType = "expense" | "revenue"
export type FilterType = "all" | "PF" | "PJ"

export interface CategoryDefinition {
  id: string
  name: string
  type: CategoryType
  budget?: number
  icon?: string
  color?: string
}

export interface Transaction {
  id: string
  categoryId: string
  amount: number
  date: string
  type: TransactionType
  description?: string
}

// Business-focused default categories
// No defaults: cada usuário começa zerado e carrega do backend

interface FinanceContextValue {
  transactions: Transaction[]
  categories: CategoryDefinition[]
  filter: FilterType
  setFilter: (f: FilterType) => void
  addTransaction: (t: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  addCategory: (name: string, type: CategoryType, budget?: number) => void
  deleteCategory: (id: string) => void
  getCategoriesByType: (type: CategoryType) => CategoryDefinition[]
  getCategoryById: (id: string) => CategoryDefinition | undefined
  filteredTransactions: Transaction[]
  totalRevenue: number
  totalExpenses: number
  balance: number
  categoryTotals: Record<string, number>
  revenueTotals: Record<string, number>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<CategoryDefinition[]>([])
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, BackendService[]>>({})
  const [filter, setFilter] = useState<FilterType>("all")

  const filteredTransactions = useMemo(() => {
    return filter === "all"
      ? transactions
      : transactions.filter(t => t.type === filter)
  }, [transactions, filter])

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id)
  }, [categories])

  const getCategoriesByType = useCallback((type: CategoryType) => {
    return categories.filter(c => c.type === type)
  }, [categories])

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])

  const { expenses, revenues } = useMemo(() => {
    const expenseIds = new Set(expenseCategories.map(c => c.id))
    const revenueIds = new Set(revenueCategories.map(c => c.id))
    
    return {
      expenses: filteredTransactions.filter(t => expenseIds.has(t.categoryId)),
      revenues: filteredTransactions.filter(t => revenueIds.has(t.categoryId)),
    }
  }, [filteredTransactions, expenseCategories, revenueCategories])

  const totalRevenue = useMemo(() => revenues.reduce((sum, t) => sum + t.amount, 0), [revenues])
  const totalExpenses = useMemo(() => expenses.reduce((sum, t) => sum + t.amount, 0), [expenses])
  const balance = totalRevenue - totalExpenses

  const categoryTotals = useMemo(() => {
    return expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }, [expenses])

  const revenueTotals = useMemo(() => {
    return revenues.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)
  }, [revenues])

  const loadFromBackend = useCallback(async () => {
    try {
      const [cats, svcs, txs] = await Promise.all([
        api.listCategories(),
        api.listServices(),
        api.listTransactions(),
      ])

      const servicesMap: Record<string, BackendService[]> = {}
      svcs.forEach(s => {
        if (!servicesMap[s.category_id]) servicesMap[s.category_id] = []
        servicesMap[s.category_id].push(s)
      })

      const categoryTypeMap: Record<string, CategoryType> = {}
      txs.forEach(t => {
        const catId = svcs.find(s => s.id === t.service_id)?.category_id
        if (!catId) return
        categoryTypeMap[catId] = t.is_expense ? "expense" : "revenue"
      })

      const mappedCats: CategoryDefinition[] = cats.map((c: BackendCategory) => ({
        id: c.id,
        name: c.name,
        type: categoryTypeMap[c.id] || "expense",
      }))

      const mappedTxs: Transaction[] = txs.map((t: BackendTransaction) => {
        const svc = svcs.find(s => s.id === t.service_id)
        const catId = svc?.category_id || ""
        const type: TransactionType = t.pjpf === "pf" || t.is_personal ? "PF" : "PJ"
        return {
          id: t.id,
          categoryId: catId,
          amount: Number(t.amount),
          date: t.transaction_date,
          type,
          description: t.description || undefined,
        }
      })

      setServicesByCategory(servicesMap)
      setCategories(mappedCats)
      setTransactions(mappedTxs)

      if (cats.length === 0 && svcs.length === 0 && txs.length === 0) {
        const seedExpense = [
          { name: "Custos Operacionais", type: "expense" as const },
          { name: "Fornecedores", type: "expense" as const },
          { name: "Marketing", type: "expense" as const },
          { name: "Impostos", type: "expense" as const },
          { name: "Ferramentas e Software", type: "expense" as const },
          { name: "Outros Gastos", type: "expense" as const },
        ]
        const seedRevenue = [
          { name: "Venda de Produtos", type: "revenue" as const },
          { name: "Serviços", type: "revenue" as const },
          { name: "Consultoria", type: "revenue" as const },
          { name: "Outras Receitas", type: "revenue" as const },
        ]
        const createdCats: CategoryDefinition[] = []
        for (const item of [...seedExpense, ...seedRevenue]) {
          try {
            const created = await api.createCategory(item.name)
            createdCats.push({ id: created.id, name: created.name, type: item.type })
            try {
              const svc = await api.createService("Geral", created.id)
              servicesMap[created.id] = [svc]
            } catch {}
          } catch {}
        }
        setServicesByCategory({ ...servicesMap })
        setCategories(createdCats)
      }
    } catch (_) {
    }
  }, [])

  useEffect(() => {
    loadFromBackend()
  }, [loadFromBackend])

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    const cat = categories.find(c => c.id === t.categoryId)
    if (!cat) return
    const typeIsExpense = cat.type === "expense"
    let svc = (servicesByCategory[t.categoryId] || [])[0]
    if (!svc) {
      try {
        svc = await api.createService("Geral", t.categoryId)
        setServicesByCategory(prev => ({ ...prev, [t.categoryId]: [svc] }))
      } catch (_) {
        return
      }
    }
    try {
      const created = await api.createTransaction({
        service_id: svc.id,
        is_expense: typeIsExpense,
        pjpf: t.type === "PF" ? "pf" : "pj",
        amount: t.amount,
        description: t.description || null,
        transaction_date: t.date,
      })
      setTransactions(prev => [
        {
          id: created.id,
          categoryId: svc.category_id,
          amount: Number(created.amount),
          date: created.transaction_date,
          type: t.type,
          description: t.description || undefined,
        },
        ...prev,
      ])
    } catch (_) {
    }
  }, [categories, servicesByCategory])

  const deleteTransaction = useCallback(async (id: string) => {
    try { await api.deleteTransaction(id) } catch (_) {}
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const addCategory = useCallback(async (name: string, type: CategoryType, budget?: number) => {
    try {
      const created = await api.createCategory(name)
      const newCat: CategoryDefinition = {
        id: created.id,
        name: created.name,
        type,
        budget,
        icon: type === "expense" ? "more" : "coins",
        color: type === "expense" ? "slate" : "lime",
      }
      setCategories(prev => [...prev, newCat])
      try {
        const svc = await api.createService("Geral", created.id)
        setServicesByCategory(prev => ({ ...prev, [created.id]: [svc] }))
      } catch (_) {}
    } catch (_) {}
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    try { await api.deleteCategory(id) } catch (_) {}
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      filter,
      setFilter,
      addTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      getCategoriesByType,
      getCategoryById,
      filteredTransactions,
      totalRevenue,
      totalExpenses,
      balance,
      categoryTotals,
      revenueTotals,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider")
  return ctx
}
