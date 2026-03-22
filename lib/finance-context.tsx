"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"

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
const DEFAULT_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { id: "operational", name: "Custos Operacionais", type: "expense", budget: 3000, icon: "building", color: "blue" },
  { id: "suppliers", name: "Fornecedores", type: "expense", budget: 5000, icon: "truck", color: "orange" },
  { id: "marketing", name: "Marketing", type: "expense", budget: 2000, icon: "megaphone", color: "pink" },
  { id: "taxes", name: "Impostos", type: "expense", budget: 4000, icon: "receipt", color: "yellow" },
  { id: "payroll", name: "Folha de Pagamento", type: "expense", budget: 8000, icon: "users", color: "purple" },
  { id: "tools", name: "Ferramentas e Software", type: "expense", budget: 1000, icon: "wrench", color: "cyan" },
  { id: "misc-expense", name: "Outros Gastos", type: "expense", icon: "more", color: "slate" },
]

const DEFAULT_REVENUE_CATEGORIES: CategoryDefinition[] = [
  { id: "product-sales", name: "Venda de Produtos", type: "revenue", icon: "package", color: "green" },
  { id: "services", name: "Serviços", type: "revenue", icon: "briefcase", color: "emerald" },
  { id: "consulting", name: "Consultoria", type: "revenue", icon: "lightbulb", color: "teal" },
  { id: "other-revenue", name: "Outras Receitas", type: "revenue", icon: "coins", color: "lime" },
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Revenue (PJ)
  { id: "1", categoryId: "product-sales", amount: 12500, date: "2026-03-01", type: "PJ", description: "Lote de produtos - Cliente ABC" },
  { id: "2", categoryId: "services", amount: 4800, date: "2026-03-03", type: "PJ", description: "Manutenção mensal - Empresa XYZ" },
  { id: "3", categoryId: "consulting", amount: 3200, date: "2026-03-05", type: "PJ", description: "Consultoria estratégica" },
  { id: "4", categoryId: "product-sales", amount: 8200, date: "2026-03-10", type: "PJ", description: "Venda direta loja" },
  { id: "5", categoryId: "services", amount: 2500, date: "2026-03-15", type: "PJ", description: "Serviço de instalação" },
  { id: "6", categoryId: "other-revenue", amount: 750, date: "2026-03-18", type: "PF", description: "Reembolso de despesas" },
  // Expenses (PJ)
  { id: "7", categoryId: "suppliers", amount: 4200, date: "2026-03-02", type: "PJ", description: "Matéria-prima mensal" },
  { id: "8", categoryId: "payroll", amount: 6500, date: "2026-03-05", type: "PJ", description: "Salários equipe" },
  { id: "9", categoryId: "operational", amount: 1800, date: "2026-03-04", type: "PJ", description: "Aluguel escritório" },
  { id: "10", categoryId: "marketing", amount: 1500, date: "2026-03-06", type: "PJ", description: "Campanha Google Ads" },
  { id: "11", categoryId: "taxes", amount: 2800, date: "2026-03-08", type: "PJ", description: "DAS Simples Nacional" },
  { id: "12", categoryId: "tools", amount: 450, date: "2026-03-09", type: "PJ", description: "Assinatura SaaS" },
  { id: "13", categoryId: "suppliers", amount: 890, date: "2026-03-12", type: "PJ", description: "Embalagens" },
  { id: "14", categoryId: "operational", amount: 320, date: "2026-03-14", type: "PJ", description: "Energia elétrica" },
  { id: "15", categoryId: "marketing", amount: 680, date: "2026-03-16", type: "PJ", description: "Material promocional" },
  // Expenses (PF)
  { id: "16", categoryId: "misc-expense", amount: 180, date: "2026-03-11", type: "PF", description: "Correios" },
  { id: "17", categoryId: "operational", amount: 95, date: "2026-03-13", type: "PF", description: "Gasolina" },
  { id: "18", categoryId: "tools", amount: 120, date: "2026-03-17", type: "PF", description: "Domínio e hospedagem" },
]

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
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [categories, setCategories] = useState<CategoryDefinition[]>([
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_REVENUE_CATEGORIES,
  ])
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

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions(prev => [
      { ...t, id: Date.now().toString() },
      ...prev,
    ])
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const addCategory = useCallback((name: string, type: CategoryType, budget?: number) => {
    const newCat: CategoryDefinition = {
      id: `custom-${Date.now()}`,
      name,
      type,
      budget,
      icon: type === "expense" ? "more" : "coins",
      color: type === "expense" ? "slate" : "lime",
    }
    setCategories(prev => [...prev, newCat])
  }, [])

  const deleteCategory = useCallback((id: string) => {
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
