"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, LineChart, Percent, PiggyBank } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardOverview } from "@/features/dashboard/api";
import { formatCurrency, formatPercent } from "@/lib/format";

export function DashboardPage() {
  const { data, isLoading } = useDashboardOverview();

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
    </div>
  );
}
