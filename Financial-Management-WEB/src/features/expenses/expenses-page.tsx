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
import { useCreateExpense, useExpenses } from "@/features/expenses/api";
import { useAccounts } from "@/features/accounts/api";
import { useCategories } from "@/features/categories/api";
import { TransactionActions } from "@/features/transactions/transaction-actions";
import {
  ExpenseNature,
  ExpenseNatureLabels,
  PaymentMethod,
  PaymentMethodLabels,
  RecurrenceType,
  RecurrenceTypeLabels,
  TransactionStatusLabels,
} from "@/types/enums";
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
  expenseNature: z.number().int(),
  recurrence: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

const paymentMethodOptions = Object.entries(PaymentMethodLabels).map(([value, label]) => ({ value, label }));
const expenseNatureOptions = Object.entries(ExpenseNatureLabels).map(([value, label]) => ({ value, label }));
const recurrenceOptions = Object.entries(RecurrenceTypeLabels).map(([value, label]) => ({ value, label }));

export function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const from = toIsoDate(firstDayOfMonth());
  const to = toIsoDate(new Date());

  const { data: expenses, isLoading } = useExpenses(from, to);
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createExpense = useCreateExpense();

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
      expenseNature: ExpenseNature.Variavel,
      recurrence: RecurrenceType.Nenhuma,
    },
  });

  const expenseCategories = categories?.filter((c) => c.type === 2) ?? [];
  const accountOptions = accounts?.map((account) => ({ value: account.id, label: account.name })) ?? [];
  const categoryOptions = expenseCategories.map((category) => ({ value: category.id, label: category.name }));

  function accountName(accountId: string) {
    return accounts?.find((a) => a.id === accountId)?.name ?? "-";
  }

  async function onSubmit(values: FormValues) {
    try {
      await createExpense.mutateAsync(values);
      toast.success("Despesa registrada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível registrar a despesa.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">Despesas fixas e variáveis do mês atual.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Despesa
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
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
                <Label htmlFor="expense-account">Conta</Label>
                <LabeledSelect
                  id="expense-account"
                  value={watch("accountId")}
                  onValueChange={(value) => setValue("accountId", value)}
                  options={accountOptions}
                  placeholder="Selecione a conta"
                />
                {errors.accountId && <p className="text-sm text-destructive">{errors.accountId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Categoria</Label>
                <LabeledSelect
                  id="expense-category"
                  value={watch("categoryId")}
                  onValueChange={(value) => setValue("categoryId", value)}
                  options={categoryOptions}
                  placeholder="Selecione a categoria"
                />
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-nature">Natureza</Label>
                  <LabeledSelect
                    id="expense-nature"
                    value={String(watch("expenseNature"))}
                    onValueChange={(value) => setValue("expenseNature", Number(value))}
                    options={expenseNatureOptions}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-recurrence">Recorrência</Label>
                  <LabeledSelect
                    id="expense-recurrence"
                    value={String(watch("recurrence"))}
                    onValueChange={(value) => setValue("recurrence", Number(value))}
                    options={recurrenceOptions}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-payment-method">Forma de Pagamento</Label>
                <LabeledSelect
                  id="expense-payment-method"
                  value={String(watch("paymentMethod"))}
                  onValueChange={(value) => setValue("paymentMethod", Number(value))}
                  options={paymentMethodOptions}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createExpense.isPending}>
                  {createExpense.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Natureza</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{formatDate(transaction.competenceDate)}</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.expenseNature ? ExpenseNatureLabels[transaction.expenseNature] : "-"}
                      </TableCell>
                      <TableCell>{PaymentMethodLabels[transaction.paymentMethod]}</TableCell>
                      <TableCell>{accountName(transaction.accountId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{TransactionStatusLabels[transaction.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <TransactionActions transaction={transaction} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma despesa registrada no período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
