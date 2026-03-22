"use client"

import { useFinance } from "@/lib/finance-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { format, parseISO, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useMemo } from "react"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-primary rounded-xl p-3 shadow-[0_0_12px_#5864FF] text-sm">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function CashFlowChart() {
  const { filteredTransactions, getCategoriesByType } = useFinance()

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])
  
  const expenseCategoryIds = useMemo(() => new Set(expenseCategories.map(c => c.id)), [expenseCategories])
  const revenueCategoryIds = useMemo(() => new Set(revenueCategories.map(c => c.id)), [revenueCategories])

  const data = useMemo(() => {
    const monthlyMap: Record<string, { revenue: number; expenses: number }> = {}

    filteredTransactions.forEach(t => {
      const month = format(startOfMonth(parseISO(t.date)), "MMM", { locale: ptBR })
      if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expenses: 0 }
      
      if (revenueCategoryIds.has(t.categoryId)) {
        monthlyMap[month].revenue += t.amount
      } else if (expenseCategoryIds.has(t.categoryId)) {
        monthlyMap[month].expenses += t.amount
      }
    })

    return Object.entries(monthlyMap).map(([month, vals]) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      Receitas: vals.revenue,
      Despesas: vals.expenses,
    }))
  }, [filteredTransactions, revenueCategoryIds, expenseCategoryIds])

  return (
    <div
      className="bg-card rounded-xl border border-primary p-5 flex flex-col shadow-[0_0_16px_#5864FF] min-h-[346px] max-h-[346px] overflow-hidden"
      style={{ height: 346, maxHeight: 346 }}
      suppressHydrationWarning
    >
      <h2 className="text-sm font-semibold text-foreground mb-4 shrink-0">Fluxo de Caixa</h2>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Nenhum dado disponível
        </div>
      ) : (
        <div className="h-full" suppressHydrationWarning>
          <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%" barGap={4} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-sidebar-border)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
            />
            <Bar dataKey="Receitas" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
