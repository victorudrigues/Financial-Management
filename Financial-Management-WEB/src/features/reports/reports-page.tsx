"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreakdownList } from "@/components/breakdown-list";
import { PeriodFilter } from "@/components/period-filter";
import { StatCard } from "@/components/stat-card";
import { useCategoryBreakdown, useCostCenterBreakdown } from "@/features/cashflow/api";
import { formatCurrency } from "@/lib/format";
import { computePreset, toApiDateTime } from "@/lib/period";

export function ReportsPage() {
  const initialRange = computePreset("month");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);

  const fromParam = toApiDateTime(from);
  const toParam = toApiDateTime(to);

  const { data: categoryBreakdown, isLoading: isLoadingCategories } = useCategoryBreakdown(fromParam, toParam);
  const { data: costCenterBreakdown, isLoading: isLoadingCostCenters } = useCostCenterBreakdown(fromParam, toParam);

  const totalByCategory = (categoryBreakdown ?? []).reduce((sum, item) => sum + item.totalAmount, 0);
  const totalByCostCenter = (costCenterBreakdown ?? []).reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Movimentações conciliadas agrupadas por categoria e centro de custo.</p>
      </div>

      <PeriodFilter from={from} to={to} onChange={(newFrom, newTo) => { setFrom(newFrom); setTo(newTo); }} />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Total Categorizado" value={formatCurrency(totalByCategory)} />
        <StatCard title="Total por Centro de Custo" value={formatCurrency(totalByCostCenter)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-56 w-full" />
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
            <CardTitle>Relatório por Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCostCenters ? (
              <Skeleton className="h-56 w-full" />
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
    </div>
  );
}
