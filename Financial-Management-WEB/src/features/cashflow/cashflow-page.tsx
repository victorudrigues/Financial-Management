"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCashFlowSummary } from "@/features/cashflow/api";
import { CashFlowChart } from "@/features/cashflow/cashflow-chart";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

function firstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function CashFlowPage() {
  const [from, setFrom] = useState(toIsoDate(firstDayOfMonth()));
  const [to, setTo] = useState(toIsoDate(new Date()));

  const { data, isLoading } = useCashFlowSummary(from, to);

  const chartData = useMemo(() => data?.dailyBreakdown ?? [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">Entradas, saídas e saldo no período selecionado.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="from">De</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to">Até</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </div>

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
