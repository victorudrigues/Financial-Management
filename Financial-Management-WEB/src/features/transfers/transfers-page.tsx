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
import { Badge } from "@/components/ui/badge";
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
import { useCreateTransfer, useTransfers } from "@/features/transfers/api";
import { useAccounts } from "@/features/accounts/api";
import { isCashAccountType } from "@/features/accounts/account-type";
import { AccountResponse, TransactionResponse } from "@/types/dtos";
import { AccountTypeLabels } from "@/types/enums";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

function firstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const accountTypeFilterOptions = [
  { value: "all", label: "Todos" },
  ...Object.entries(AccountTypeLabels).map(([value, label]) => ({ value, label })),
];
const statusFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativa" },
  { value: "inactive", label: "Inativa" },
];
const directionFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "outgoing", label: "Enviada" },
  { value: "incoming", label: "Recebida" },
];

const schema = z
  .object({
    amount: z.number().positive("O valor deve ser maior que zero."),
    sourceAccountId: z.string().min(1, "Selecione a conta de origem."),
    destinationAccountId: z.string().min(1, "Selecione a conta de destino."),
    competenceDate: z.string().min(1, "Informe a data."),
    notes: z.string().optional(),
  })
  .refine((values) => values.sourceAccountId !== values.destinationAccountId, {
    message: "A conta de destino deve ser diferente da conta de origem.",
    path: ["destinationAccountId"],
  });

type FormValues = z.infer<typeof schema>;

export function TransfersPage() {
  const [open, setOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<AccountResponse | null>(null);
  const [filterAccountName, setFilterAccountName] = useState("");
  const [filterAccountType, setFilterAccountType] = useState("all");
  const [filterAccountStatus, setFilterAccountStatus] = useState("all");
  const [filterHistoryFrom, setFilterHistoryFrom] = useState(toIsoDate(firstDayOfMonth()));
  const [filterHistoryTo, setFilterHistoryTo] = useState(toIsoDate(new Date()));
  const [filterHistoryDirection, setFilterHistoryDirection] = useState("all");

  const { data: transfers, isLoading: transfersLoading } = useTransfers(filterHistoryFrom, filterHistoryTo);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const createTransfer = useCreateTransfer();

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

  const accountTypeById = new Map((accounts ?? []).map((account) => [account.id, account.type]));
  const accountNameById = new Map((accounts ?? []).map((account) => [account.id, account.name]));

  // A transfer whose source is a non-cash account and whose destination is a cash/wallet account
  // is a Saque (handled by the dedicated Withdrawals module) — this module only covers transfers
  // between accounts that aren't that specific combination.
  function isWithdrawal(transfer: TransactionResponse) {
    if (!transfer.destinationAccountId) return false;
    const sourceType = accountTypeById.get(transfer.accountId);
    const destinationType = accountTypeById.get(transfer.destinationAccountId);
    if (sourceType === undefined || destinationType === undefined) return false;
    return !isCashAccountType(sourceType) && isCashAccountType(destinationType);
  }

  const accountTransfers = transfers?.filter((t) => !isWithdrawal(t)) ?? [];

  const filteredAccounts =
    accounts?.filter((account) => {
      if (filterAccountType !== "all" && String(account.type) !== filterAccountType) return false;
      if (filterAccountStatus !== "all" && account.isActive !== (filterAccountStatus === "active")) return false;
      if (filterAccountName && !account.name.toLowerCase().includes(filterAccountName.toLowerCase())) return false;
      return true;
    }) ?? [];

  const accountOptions = accounts?.map((account) => ({ value: account.id, label: account.name })) ?? [];
  const sourceAccountId = watch("sourceAccountId");
  const sourceType = sourceAccountId ? accountTypeById.get(sourceAccountId) : undefined;
  const destinationOptions = accountOptions.filter((option) => {
    if (option.value === sourceAccountId) return false;
    if (sourceType !== undefined && !isCashAccountType(sourceType)) {
      const destinationType = accountTypeById.get(option.value);
      if (destinationType !== undefined && isCashAccountType(destinationType)) return false;
    }
    return true;
  });

  async function onSubmit(values: FormValues) {
    try {
      await createTransfer.mutateAsync({
        ...values,
        notes: values.notes || null,
      });
      toast.success("Transferência realizada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível realizar a transferência.");
    }
  }

  const accountHistory = viewingAccount
    ? accountTransfers.filter((t) => {
        const isOutgoing = t.accountId === viewingAccount.id;
        const isIncoming = t.destinationAccountId === viewingAccount.id;
        if (!isOutgoing && !isIncoming) return false;
        if (filterHistoryDirection === "outgoing" && !isOutgoing) return false;
        if (filterHistoryDirection === "incoming" && !isIncoming) return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transferências</h1>
          <p className="text-muted-foreground">Saldo das contas e transferências entre elas. Para retirar dinheiro em espécie, use o módulo de Saque.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Transferência
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transferência</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Valor</Label>
                <CurrencyInput id="transfer-amount" value={watch("amount")} onChange={(value) => setValue("amount", value)} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-source">Conta de Origem</Label>
                  <LabeledSelect
                    id="transfer-source"
                    value={watch("sourceAccountId")}
                    onValueChange={(value) => {
                      setValue("sourceAccountId", value);
                      if (watch("destinationAccountId") === value) {
                        setValue("destinationAccountId", "");
                      }
                    }}
                    options={accountOptions}
                    placeholder="Selecione a conta"
                  />
                  {errors.sourceAccountId && <p className="text-sm text-destructive">{errors.sourceAccountId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transfer-destination">Conta de Destino</Label>
                  <LabeledSelect
                    id="transfer-destination"
                    value={watch("destinationAccountId")}
                    onValueChange={(value) => setValue("destinationAccountId", value)}
                    options={destinationOptions}
                    placeholder="Selecione a conta"
                    disabled={!sourceAccountId}
                  />
                  {errors.destinationAccountId && (
                    <p className="text-sm text-destructive">{errors.destinationAccountId.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-date">Data</Label>
                <Input id="transfer-date" type="date" {...register("competenceDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-notes">Observações (opcional)</Label>
                <Input id="transfer-notes" {...register("notes")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTransfer.isPending}>
                  {createTransfer.isPending ? "Salvando..." : "Salvar"}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-account-name">Descrição</Label>
              <Input
                id="filter-account-name"
                value={filterAccountName}
                onChange={(e) => setFilterAccountName(e.target.value)}
                placeholder="Buscar por nome da conta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-account-type">Tipo</Label>
              <LabeledSelect
                id="filter-account-type"
                value={filterAccountType}
                onValueChange={setFilterAccountType}
                options={accountTypeFilterOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-account-status">Status</Label>
              <LabeledSelect
                id="filter-account-status"
                value={filterAccountStatus}
                onValueChange={setFilterAccountStatus}
                options={statusFilterOptions}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo das Contas</CardTitle>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{AccountTypeLabels[account.type]}</TableCell>
                    <TableCell>{formatCurrency(account.currentBalance)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setViewingAccount(account)}>
                        Detalhar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAccounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma conta cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell />
                  <TableCell className="font-semibold">
                    {formatCurrency(filteredAccounts.reduce((sum, a) => sum + a.currentBalance, 0))}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingAccount} onOpenChange={(next) => !next && setViewingAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Transferências — {viewingAccount?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-history-from">De</Label>
              <Input
                id="filter-history-from"
                type="date"
                value={filterHistoryFrom}
                onChange={(e) => setFilterHistoryFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-history-to">Até</Label>
              <Input
                id="filter-history-to"
                type="date"
                value={filterHistoryTo}
                onChange={(e) => setFilterHistoryTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-history-direction">Direção</Label>
              <LabeledSelect
                id="filter-history-direction"
                value={filterHistoryDirection}
                onValueChange={setFilterHistoryDirection}
                options={directionFilterOptions}
              />
            </div>
          </div>
          {transfersLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Direção</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountHistory.map((transfer) => {
                  const isOutgoing = viewingAccount ? transfer.accountId === viewingAccount.id : false;
                  const counterpartId = isOutgoing ? transfer.destinationAccountId : transfer.accountId;
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell>{formatDate(transfer.competenceDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{isOutgoing ? "Enviada" : "Recebida"}</Badge>
                      </TableCell>
                      <TableCell>{counterpartId ? accountNameById.get(counterpartId) ?? "-" : "-"}</TableCell>
                      <TableCell className={isOutgoing ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                        {isOutgoing ? "-" : "+"}
                        {formatCurrency(transfer.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {accountHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma transferência registrada no período.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
