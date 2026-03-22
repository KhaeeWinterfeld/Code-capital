"use client"

import { useFinance, type FilterType } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ListOrdered, Wallet } from "lucide-react"

interface NavbarProps {
  currentPage: "dashboard" | "transactions"
  onNavigate: (page: "dashboard" | "transactions") => void
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { filter, setFilter } = useFinance()

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "all" },
    { label: "PF", value: "PF" },
    { label: "PJ", value: "PJ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground text-base tracking-tight">Code&Capital</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onNavigate("dashboard")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentPage === "dashboard"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("transactions")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentPage === "transactions"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ListOrdered className="w-4 h-4" />
            Transações
          </button>
        </nav>

        {/* Global Filter */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                filter === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex border-t border-border">
        <button
          onClick={() => onNavigate("dashboard")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            currentPage === "dashboard" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate("transactions")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            currentPage === "transactions" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ListOrdered className="w-4 h-4" />
          Transações
        </button>
      </div>
    </header>
  )
}
