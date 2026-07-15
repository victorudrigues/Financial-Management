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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useCreateIncome, useIncome } from "@/features/income/api";
import { useAccounts } from "@/features/accounts/api";
import { useCategories } from "@/features/categories/api";
import { TransactionActions } from "@/features/transactions/transaction-actions";
import { PaymentMethod, PaymentMethodLabels, TransactionStatusLabels } from "@/types/enums";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

function firstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const schema = z.object({
  description: z.string().min(1, "Informe a descrição."),
  amount: z.number().positive("O valor deve ser maior que zero."),
  accountId: z.string().min(1, "Selecione a conta."),
  categoryId: z.string().min(1, "Selecione a categoria."),
  competenceDate: z.string().min(1, "Informe a data."),
  paymentMethod: z.number().int(),
  clientName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const paymentMethodOptions = Object.entries(PaymentMethodLabels).map(([value, label]) => ({ value, label }));

export function IncomePage() {
  const [open, setOpen] = useState(false);
  const from = toIsoDate(firstDayOfMonth());
  const to = toIsoDate(new Date());

  const { data: income, isLoading } = useIncome(from, to);
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createIncome = useCreateIncome();

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
      description: "",
      amount: 0,
      accountId: "",
      categoryId: "",
      competenceDate: toIsoDate(new Date()),
      paymentMethod: PaymentMethod.Pix,
      clientName: "",
    },
  });

  const incomeCategories = categories?.filter((c) => c.type === 1) ?? [];
  const accountOptions = accounts?.map((account) => ({ value: account.id, label: account.name })) ?? [];
  const categoryOptions = incomeCategories.map((category) => ({ value: category.id, label: category.name }));

  async function onSubmit(values: FormValues) {
    try {
      await createIncome.mutateAsync(values);
      toast.success("Receita registrada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível registrar a receita.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground">Receitas registradas no mês atual.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Receita
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Receita</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" {...register("description")} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <CurrencyInput id="amount" value={watch("amount")} onChange={(value) => setValue("amount", value)} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competenceDate">Data</Label>
                  <Input id="competenceDate" type="date" {...register("competenceDate")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-account">Conta</Label>
                <LabeledSelect
                  id="income-account"
                  value={watch("accountId")}
                  onValueChange={(value) => setValue("accountId", value)}
                  options={accountOptions}
                  placeholder="Selecione a conta"
                />
                {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-category">Categoria</Label>
                <LabeledSelect
                  id="income-category"
                  value={watch("categoryId")}
                  onValueChange={(value) => setValue("categoryId", value)}
                  options={categoryOptions}
                  placeholder="Selecione a categoria"
                />
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-payment-method">Forma de Pagamento</Label>
                <LabeledSelect
                  id="income-payment-method"
                  value={String(watch("paymentMethod"))}
                  onValueChange={(value) => setValue("paymentMethod", Number(value))}
                  options={paymentMethodOptions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Cliente (opcional)</Label>
                <Input id="clientName" {...register("clientName")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createIncome.isPending}>
                  {createIncome.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {income?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{formatDate(transaction.competenceDate)}</TableCell>
                    <TableCell className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{TransactionStatusLabels[transaction.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      <TransactionActions transaction={transaction} />
                    </TableCell>
                  </TableRow>
                ))}
                {income?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma receita registrada no período.
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
