"use client"

import { useFinance } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Scale } from "lucide-react"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function SummaryCards() {
  const { totalRevenue, totalExpenses, balance } = useFinance()

  const cards = [
    {
      label: "Receita Total",
      value: totalRevenue,
      icon: TrendingUp,
      className: "bg-success-muted border-success/20",
      iconClass: "text-success",
      valueClass: "text-success",
    },
    {
      label: "Despesas Totais",
      value: totalExpenses,
      icon: TrendingDown,
      className: "bg-danger-muted border-danger/20",
      iconClass: "text-danger",
      valueClass: "text-danger",
    },
    {
      label: "Saldo Atual",
      value: balance,
      icon: Scale,
      className: balance >= 0 ? "bg-success-muted border-success/20" : "bg-danger-muted border-danger/20",
      iconClass: balance >= 0 ? "text-success" : "text-danger",
      valueClass: balance >= 0 ? "text-success" : "text-danger",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={cn("rounded-lg border p-3 transition-all", card.className)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-card/60", card.iconClass)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className={cn("text-lg lg:text-xl font-bold tracking-tight", card.valueClass)}>
              {formatCurrency(card.value)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
