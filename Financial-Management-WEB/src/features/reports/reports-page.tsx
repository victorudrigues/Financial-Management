"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BreakdownList } from "@/components/breakdown-list";
import { PeriodFilter } from "@/components/period-filter";
import { StatCard } from "@/components/stat-card";
import {
  useCashFlowSummary,
  useCategoryBreakdown,
  useCostCenterBreakdown,
  usePaymentMachineBreakdown,
} from "@/features/cashflow/api";
import { downloadCashFlowReport } from "@/features/reports/api";
import { formatCurrency } from "@/lib/format";
import { computePreset, toApiDateTime } from "@/lib/period";
import { CategoryType } from "@/types/enums";

export function ReportsPage() {
  const initialRange = computePreset("month");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [downloadingFormat, setDownloadingFormat] = useState<"Pdf" | "Excel" | null>(null);

  const fromParam = toApiDateTime(from);
  const toParam = toApiDateTime(to);

  const { data: summary, isLoading: isLoadingSummary } = useCashFlowSummary(fromParam, toParam);
  const { data: categoryBreakdown, isLoading: isLoadingCategories } = useCategoryBreakdown(fromParam, toParam);
  const { data: costCenterBreakdown, isLoading: isLoadingCostCenters } = useCostCenterBreakdown(fromParam, toParam);
  const { data: machineBreakdown, isLoading: isLoadingMachines } = usePaymentMachineBreakdown(fromParam, toParam);

  const incomeCategories = (categoryBreakdown ?? []).filter((item) => item.categoryType === CategoryType.Receita);
  const expenseCategories = (categoryBreakdown ?? []).filter((item) => item.categoryType === CategoryType.Despesa);
  const otherCategories = (categoryBreakdown ?? []).filter(
    (item) => item.categoryType !== CategoryType.Receita && item.categoryType !== CategoryType.Despesa
  );

  const totalMachineFees = (machineBreakdown ?? []).reduce((sum, item) => sum + item.feeAmount, 0);

  async function handleDownload(format: "Pdf" | "Excel") {
    setDownloadingFormat(format);
    try {
      await downloadCashFlowReport(fromParam, toParam, format);
    } catch {
      toast.error("Não foi possível gerar o relatório.");
    } finally {
      setDownloadingFormat(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Entradas, saídas, taxas de maquineta e centros de custo das movimentações conciliadas no período.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownload("Pdf")} disabled={downloadingFormat !== null}>
            <FileText className="mr-2 h-4 w-4" />
            {downloadingFormat === "Pdf" ? "Gerando..." : "Baixar PDF"}
          </Button>
          <Button variant="outline" onClick={() => handleDownload("Excel")} disabled={downloadingFormat !== null}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {downloadingFormat === "Excel" ? "Gerando..." : "Baixar Excel"}
          </Button>
        </div>
      </div>

      <PeriodFilter from={from} to={to} onChange={(newFrom, newTo) => { setFrom(newFrom); setTo(newTo); }} />

      {isLoadingSummary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Entradas" value={formatCurrency(summary?.totalIncome ?? 0)} tone="positive" />
          <StatCard title="Saídas" value={formatCurrency(summary?.totalExpense ?? 0)} tone="negative" />
          <StatCard title="Taxas de Maquineta" value={formatCurrency(totalMachineFees)} tone="negative" />
          <StatCard
            title="Resultado do Período"
            value={formatCurrency(summary?.netFlow ?? 0)}
            tone={(summary?.netFlow ?? 0) >= 0 ? "positive" : "negative"}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Entradas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <BreakdownList
                emptyLabel="Nenhuma entrada categorizada no período."
                entries={incomeCategories.map((item) => ({
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
            <CardTitle>Saídas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <BreakdownList
                emptyLabel="Nenhuma saída categorizada no período."
                entries={expenseCategories.map((item) => ({
                  key: item.categoryId,
                  name: item.categoryName,
                  amount: item.totalAmount,
                  color: item.color,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {otherCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outras Movimentações por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              emptyLabel="Nenhuma outra movimentação categorizada no período."
              entries={otherCategories.map((item) => ({
                key: item.categoryId,
                name: item.categoryName,
                amount: item.totalAmount,
                color: item.color,
              }))}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Custo das Maquinetas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMachines ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Maquineta</TableHead>
                  <TableHead>Valor Bruto</TableHead>
                  <TableHead>Taxas</TableHead>
                  <TableHead>Valor Líquido</TableHead>
                  <TableHead>Qtd.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machineBreakdown?.map((item) => (
                  <TableRow key={item.paymentMachineId}>
                    <TableCell className="font-medium">{item.paymentMachineName}</TableCell>
                    <TableCell>{formatCurrency(item.grossAmount)}</TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">{formatCurrency(item.feeAmount)}</TableCell>
                    <TableCell>{formatCurrency(item.netAmount)}</TableCell>
                    <TableCell>{item.transactionCount}</TableCell>
                  </TableRow>
                ))}
                {machineBreakdown?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma venda em maquineta no período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Entradas</TableHead>
                  <TableHead>Saídas</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Qtd.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenterBreakdown?.map((item) => (
                  <TableRow key={item.costCenterId ?? "unassigned"}>
                    <TableCell className="font-medium">{item.costCenterName}</TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.incomeAmount)}
                    </TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">
                      {formatCurrency(item.expenseAmount)}
                    </TableCell>
                    <TableCell>{formatCurrency(item.incomeAmount - item.expenseAmount)}</TableCell>
                    <TableCell>{item.transactionCount}</TableCell>
                  </TableRow>
                ))}
                {costCenterBreakdown?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma movimentação com centro de custo no período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
