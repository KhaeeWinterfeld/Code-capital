"use client"

import { useState } from "react"
import { FinanceProvider } from "@/lib/finance-context"
import { Navbar } from "@/components/navbar"
import { SummaryCards } from "@/components/summary-cards"
import { CashFlowChart } from "@/components/cash-flow-chart"
import { CategoryCards } from "@/components/category-cards"
import { DistributionCharts } from "@/components/distribution-charts"
import { ExpensesList } from "@/components/expenses-list"
import { AddTransactionModal, AddTransactionFAB } from "@/components/add-transaction-modal"

type Page = "dashboard" | "transactions"

function AppContent() {
  const [page, setPage] = useState<Page>("dashboard")
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar currentPage={page} onNavigate={setPage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {page === "dashboard" && (
          <div className="flex flex-col h-full overflow-hidden px-4">
            {/* Header Section */}
            <div className="py-4 border-b border-border shrink-0">
              <h1 className="text-xl font-bold text-foreground text-balance">Visão Geral</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Março de 2026</p>
            </div>

            {/* Desktop Grid Layout - No Scroll */}
            <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
              {/* Row 1: Summary Cards - Fixed Height */}
              <div className="shrink-0">
                <SummaryCards />
              </div>

              {/* Row 2: Main Analytics - Two Columns with Flex */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 max-w-7xl mx-auto w-full">
                {/* Left Column - Cash Flow Chart */}
                <div className="lg:col-span-2 min-h-0">
                  <CashFlowChart />
                </div>

                {/* Right Column - Categories */}
                <div className="lg:col-span-1 min-h-0">
                  <CategoryCards />
                </div>
              </div>

              {/* Row 3: Distribution Charts - Compact */}
              <div className="shrink-0 max-w-7xl mx-auto w-full">
                <DistributionCharts />
              </div>
            </div>
          </div>
        )}

        {page === "transactions" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header Section */}
            <div className="px-4 py-6 border-b border-border shrink-0">
              <h1 className="text-xl font-bold text-foreground text-balance">Transações</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Todas as suas movimentações financeiras</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 py-6">
                <ExpensesList />
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <AddTransactionFAB onClick={() => setModalOpen(true)} />
      </div>
      <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}

export default function Page() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}
