"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreakdownList } from "@/components/breakdown-list";
import { PeriodFilter } from "@/components/period-filter";
import { useCashFlowSummary, useCategoryBreakdown, useCostCenterBreakdown } from "@/features/cashflow/api";
import { CashFlowChart } from "@/features/cashflow/cashflow-chart";
import { formatCurrency, formatDate } from "@/lib/format";
import { computePreset, toApiDateTime } from "@/lib/period";

export function CashFlowPage() {
  const initialRange = computePreset("month");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);

  const fromParam = toApiDateTime(from);
  const toParam = toApiDateTime(to);

  const { data, isLoading } = useCashFlowSummary(fromParam, toParam);
  const { data: categoryBreakdown, isLoading: isLoadingCategories } = useCategoryBreakdown(fromParam, toParam);
  const { data: costCenterBreakdown, isLoading: isLoadingCostCenters } = useCostCenterBreakdown(fromParam, toParam);

  const chartData = useMemo(() => data?.dailyBreakdown ?? [], [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">Entradas, saídas e saldo no período selecionado.</p>
      </div>

      <PeriodFilter from={from} to={to} onChange={(newFrom, newTo) => { setFrom(newFrom); setTo(newTo); }} />

      {isLoading || !data ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Entradas" value={formatCurrency(data.totalIncome)} tone="positive" />
            <StatCard title="Saídas" value={formatCurrency(data.totalExpense)} tone="negative" />
            <StatCard title="Resultado do Período" value={formatCurrency(data.netFlow)} tone={data.netFlow >= 0 ? "positive" : "negative"} />
            <StatCard title="Saldo Consolidado" value={formatCurrency(data.currentAccumulatedBalance)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Diária</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <CashFlowChart data={chartData} />
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação conciliada no período.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <BreakdownList
                    emptyLabel="Nenhuma movimentação categorizada no período."
                    entries={(categoryBreakdown ?? []).map((item) => ({
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
                <CardTitle>Por Centro de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCostCenters ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <BreakdownList
                    emptyLabel="Nenhuma movimentação com centro de custo no período."
                    entries={(costCenterBreakdown ?? []).map((item) => ({
                      key: item.costCenterId ?? "unassigned",
                      name: item.costCenterName,
                      amount: item.totalAmount,
                    }))}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Entradas</TableHead>
                    <TableHead>Saídas</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{formatDate(day.date)}</TableCell>
                      <TableCell className="text-emerald-600 dark:text-emerald-400">{formatCurrency(day.income)}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">{formatCurrency(day.expense)}</TableCell>
                      <TableCell>{formatCurrency(day.balance)}</TableCell>
                    </TableRow>
                  ))}
                  {chartData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Sem dados para o período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
