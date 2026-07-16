"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, LineChart, Percent, PiggyBank } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreakdownList } from "@/components/breakdown-list";
import { useDashboardOverview } from "@/features/dashboard/api";
import { useCategoryBreakdown, useCostCenterBreakdown } from "@/features/cashflow/api";
import { formatCurrency, formatPercent } from "@/lib/format";
import { computePreset, toApiDateTime } from "@/lib/period";

export function DashboardPage() {
  const { data, isLoading } = useDashboardOverview();

  const currentMonth = computePreset("month");
  const fromParam = toApiDateTime(currentMonth.from);
  const toParam = toApiDateTime(currentMonth.to);

  const { data: categoryBreakdown, isLoading: isLoadingCategories } = useCategoryBreakdown(fromParam, toParam);
  const { data: costCenterBreakdown, isLoading: isLoadingCostCenters } = useCostCenterBreakdown(fromParam, toParam);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Saldo Atual", value: formatCurrency(data.currentBalance), icon: <Wallet className="h-4 w-4 text-muted-foreground" /> },
    { title: "Entradas do Dia", value: formatCurrency(data.todayIncome), tone: "positive" as const, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
    { title: "Saídas do Dia", value: formatCurrency(data.todayExpense), tone: "negative" as const, icon: <TrendingDown className="h-4 w-4 text-muted-foreground" /> },
    { title: "Saldo Previsto", value: formatCurrency(data.projectedBalance), icon: <LineChart className="h-4 w-4 text-muted-foreground" /> },
    { title: "Receitas do Mês", value: formatCurrency(data.monthlyIncome), tone: "positive" as const, icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
    { title: "Despesas do Mês", value: formatCurrency(data.monthlyExpense), tone: "negative" as const, icon: <TrendingDown className="h-4 w-4 text-muted-foreground" /> },
    { title: "Lucro", value: formatCurrency(data.profit), tone: data.profit >= 0 ? ("positive" as const) : ("negative" as const), icon: <PiggyBank className="h-4 w-4 text-muted-foreground" /> },
    { title: "Margem", value: formatPercent(data.marginPercent), icon: <Percent className="h-4 w-4 text-muted-foreground" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua situação financeira.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Categorias (mês atual)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <BreakdownList
                emptyLabel="Nenhuma movimentação categorizada neste mês."
                entries={(categoryBreakdown ?? []).slice(0, 5).map((item) => ({
                  key: item.categoryId,
                  name: item.categoryName,
                  amount: item.totalAmount,
                  color: item.color,
                }))}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Centro de Custo (mês atual)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCostCenters ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <BreakdownList
                emptyLabel="Nenhuma movimentação com centro de custo neste mês."
                entries={(costCenterBreakdown ?? []).slice(0, 5).map((item) => ({
                  key: item.costCenterId ?? "unassigned",
                  name: item.costCenterName,
                  amount: item.incomeAmount + item.expenseAmount,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
