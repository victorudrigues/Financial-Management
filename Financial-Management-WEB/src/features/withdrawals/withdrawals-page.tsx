"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LabeledSelect } from "@/components/labeled-select";
import { CurrencyInput } from "@/components/currency-input";
import { useCreateWithdrawal, useWithdrawalTransfers } from "@/features/withdrawals/api";
import { useAccounts } from "@/features/accounts/api";
import { isCashAccountType } from "@/features/accounts/account-type";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

function firstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const schema = z.object({
  amount: z.number().positive("O valor deve ser maior que zero."),
  sourceAccountId: z.string().min(1, "Selecione a conta de origem."),
  destinationAccountId: z.string().min(1, "Selecione para qual carteira o dinheiro vai."),
  competenceDate: z.string().min(1, "Informe a data."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function WithdrawalsPage() {
  const [open, setOpen] = useState(false);
  const [filterFrom, setFilterFrom] = useState(toIsoDate(firstDayOfMonth()));
  const [filterTo, setFilterTo] = useState(toIsoDate(new Date()));
  const [filterSourceAccountId, setFilterSourceAccountId] = useState("all");
  const [filterDestinationAccountId, setFilterDestinationAccountId] = useState("all");

  const { data: transfers, isLoading } = useWithdrawalTransfers(filterFrom, filterTo);
  const { data: accounts } = useAccounts();
  const createWithdrawal = useCreateWithdrawal();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      sourceAccountId: "",
      destinationAccountId: "",
      competenceDate: toIsoDate(new Date()),
      notes: "",
    },
  });

  const accountNameById = new Map((accounts ?? []).map((account) => [account.id, account.name]));
  const accountTypeById = new Map((accounts ?? []).map((account) => [account.id, account.type]));

  const sourceOptions =
    accounts?.filter((account) => !isCashAccountType(account.type)).map((account) => ({ value: account.id, label: account.name })) ?? [];
  const destinationOptions =
    accounts?.filter((account) => isCashAccountType(account.type)).map((account) => ({ value: account.id, label: account.name })) ?? [];

  // A withdrawal is a transfer from a non-cash account into a cash/wallet account.
  const withdrawals = (transfers ?? []).filter((t) => {
    if (!t.destinationAccountId) return false;
    const sourceType = accountTypeById.get(t.accountId);
    const destinationType = accountTypeById.get(t.destinationAccountId);
    if (sourceType === undefined || destinationType === undefined) return false;
    if (isCashAccountType(sourceType) || !isCashAccountType(destinationType)) return false;
    if (filterSourceAccountId !== "all" && t.accountId !== filterSourceAccountId) return false;
    if (filterDestinationAccountId !== "all" && t.destinationAccountId !== filterDestinationAccountId) return false;
    return true;
  });

  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);
  const sourceFilterOptions = [{ value: "all", label: "Todos" }, ...sourceOptions];
  const destinationFilterOptions = [{ value: "all", label: "Todos" }, ...destinationOptions];

  async function onSubmit(values: FormValues) {
    try {
      await createWithdrawal.mutateAsync({
        ...values,
        notes: values.notes || null,
      });
      toast.success("Saque realizado com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível realizar o saque.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Saque</h1>
          <p className="text-muted-foreground">Retiradas de dinheiro em espécie no mês atual.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Saque
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Saque</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount">Valor</Label>
                <CurrencyInput
                  id="withdrawal-amount"
                  value={watch("amount")}
                  onChange={(value) => setValue("amount", value)}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal-source">Conta de Origem</Label>
                <LabeledSelect
                  id="withdrawal-source"
                  value={watch("sourceAccountId")}
                  onValueChange={(value) => setValue("sourceAccountId", value)}
                  options={sourceOptions}
                  placeholder="Selecione a conta"
                />
                {errors.sourceAccountId && <p className="text-sm text-destructive">{errors.sourceAccountId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal-destination">Carteira de Destino</Label>
                <LabeledSelect
                  id="withdrawal-destination"
                  value={watch("destinationAccountId")}
                  onValueChange={(value) => setValue("destinationAccountId", value)}
                  options={destinationOptions}
                  placeholder="Selecione a carteira"
                />
                {errors.destinationAccountId && (
                  <p className="text-sm text-destructive">{errors.destinationAccountId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal-date">Data</Label>
                <Input id="withdrawal-date" type="date" {...register("competenceDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawal-notes">Observações (opcional)</Label>
                <Input id="withdrawal-notes" {...register("notes")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createWithdrawal.isPending}>
                  {createWithdrawal.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filter-from">De</Label>
              <Input id="filter-from" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-to">Até</Label>
              <Input id="filter-to" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-source">Conta de Origem</Label>
              <LabeledSelect
                id="filter-source"
                value={filterSourceAccountId}
                onValueChange={setFilterSourceAccountId}
                options={sourceFilterOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-destination">Carteira</Label>
              <LabeledSelect
                id="filter-destination"
                value={filterDestinationAccountId}
                onValueChange={setFilterDestinationAccountId}
                options={destinationFilterOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saques do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.competenceDate)}</TableCell>
                    <TableCell>{accountNameById.get(withdrawal.accountId) ?? "-"}</TableCell>
                    <TableCell>
                      {withdrawal.destinationAccountId ? accountNameById.get(withdrawal.destinationAccountId) ?? "-" : "-"}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum saque registrado no período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(totalWithdrawals)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
