"use client"

import { useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const EXPENSE_COLORS = [
  "oklch(0.42 0.13 255)",   // primary blue
  "oklch(0.65 0.18 30)",    // orange
  "oklch(0.72 0.15 330)",   // pink
  "oklch(0.72 0.18 60)",    // yellow
  "oklch(0.55 0.15 290)",   // purple
  "oklch(0.65 0.14 200)",   // cyan
  "oklch(0.55 0.02 240)",   // slate
]

const REVENUE_COLORS = [
  "oklch(0.54 0.17 145)",   // green
  "oklch(0.65 0.16 160)",   // emerald
  "oklch(0.60 0.14 180)",   // teal
  "oklch(0.70 0.18 130)",   // lime
]

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface ChartData {
  name: string
  value: number
  percent: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartData }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-foreground">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(data.value)} ({data.percent.toFixed(1)}%)
      </p>
    </div>
  )
}

export function DistributionCharts() {
  const { categoryTotals, revenueTotals, getCategoriesByType } = useFinance()

  const expenseCategories = useMemo(() => getCategoriesByType("expense"), [getCategoriesByType])
  const revenueCategories = useMemo(() => getCategoriesByType("revenue"), [getCategoriesByType])

  const expenseData = useMemo(() => {
    const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)
    if (total === 0) return []
    
    return expenseCategories
      .map(cat => ({
        name: cat.name,
        value: categoryTotals[cat.id] || 0,
        percent: ((categoryTotals[cat.id] || 0) / total) * 100,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [categoryTotals, expenseCategories])

  const revenueData = useMemo(() => {
    const total = Object.values(revenueTotals).reduce((sum, v) => sum + v, 0)
    if (total === 0) return []
    
    return revenueCategories
      .map(cat => ({
        name: cat.name,
        value: revenueTotals[cat.id] || 0,
        percent: ((revenueTotals[cat.id] || 0) / total) * 100,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [revenueTotals, revenueCategories])

  const totalExpenses = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)
  const totalRevenue = Object.values(revenueTotals).reduce((sum, v) => sum + v, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Expense Distribution */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">Distribuição de Despesas</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Total: {formatCurrency(totalExpenses)}
        </p>
        
        {expenseData.length === 0 ? (
          <div className="h-28 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Sem dados</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-40 h-40 shrink-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseData.map((_, idx) => (
                      <Cell key={idx} fill={EXPENSE_COLORS[idx % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              {expenseData.slice(0, 4).map((d, idx) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}
                  />
                  <span className="text-xs text-foreground truncate flex-1">{d.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{d.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Revenue Distribution */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wide">Distribuição de Receitas</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Total: {formatCurrency(totalRevenue)}
        </p>
        
        {revenueData.length === 0 ? (
          <div className="h-28 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Sem dados</p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-40 h-40 shrink-0 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueData.map((_, idx) => (
                      <Cell key={idx} fill={REVENUE_COLORS[idx % REVENUE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              {revenueData.slice(0, 4).map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: REVENUE_COLORS[idx % REVENUE_COLORS.length] }}
                  />
                  <span className="text-xs text-foreground truncate flex-1">{d.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{d.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
