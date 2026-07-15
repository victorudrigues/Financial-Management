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
import { RowActions } from "@/components/row-actions";
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
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/features/accounts/api";
import { AccountType, AccountTypeLabels } from "@/types/enums";
import { AccountResponse } from "@/types/dtos";
import { formatCurrency } from "@/lib/format";

const accountTypeOptions = Object.entries(AccountTypeLabels).map(([value, label]) => ({ value, label }));

const schema = z.object({
  name: z.string().min(1, "Informe o nome da conta."),
  type: z.number().int(),
  initialBalance: z.number(),
});

type FormValues = z.infer<typeof schema>;

type DialogMode = "view" | "edit";

export function AccountsPage() {
  const [open, setOpen] = useState(false);
  const [dialogAccount, setDialogAccount] = useState<{ account: AccountResponse; mode: DialogMode } | null>(null);
  const [editName, setEditName] = useState("");

  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: AccountType.ContaCorrente, initialBalance: 0 },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createAccount.mutateAsync(values);
      toast.success("Conta criada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a conta.");
    }
  }

  function openDialog(account: AccountResponse, mode: DialogMode) {
    setDialogAccount({ account, mode });
    setEditName(account.name);
  }

  async function handleUpdate() {
    if (!dialogAccount) return;
    try {
      await updateAccount.mutateAsync({ id: dialogAccount.account.id, name: editName });
      toast.success("Conta atualizada com sucesso.");
      setDialogAccount(null);
    } catch {
      toast.error("Não foi possível atualizar a conta.");
    }
  }

  async function handleDelete(account: AccountResponse) {
    try {
      await deleteAccount.mutateAsync(account.id);
      toast.success("Conta excluída com sucesso.");
    } catch {
      toast.error("Não foi possível excluir a conta. Verifique se não há movimentações vinculadas.");
    }
  }

  const isViewMode = dialogAccount?.mode === "view";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">Contas financeiras utilizadas nas movimentações.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Conta
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-type">Tipo</Label>
                <LabeledSelect
                  id="account-type"
                  value={String(watch("type"))}
                  onValueChange={(value) => setValue("type", Number(value))}
                  options={accountTypeOptions}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialBalance">Saldo Inicial</Label>
                <CurrencyInput
                  id="initialBalance"
                  value={watch("initialBalance")}
                  onChange={(value) => setValue("initialBalance", value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!dialogAccount} onOpenChange={(isOpen) => !isOpen && setDialogAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isViewMode ? "Detalhes da Conta" : "Editar Conta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isViewMode} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-account-type">Tipo</Label>
              <LabeledSelect
                id="view-account-type"
                value={dialogAccount ? String(dialogAccount.account.type) : ""}
                onValueChange={() => {}}
                options={accountTypeOptions}
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Saldo Inicial</Label>
                <CurrencyInput value={dialogAccount?.account.initialBalance ?? 0} onChange={() => {}} disabled />
              </div>
              <div className="space-y-2">
                <Label>Saldo Atual</Label>
                <CurrencyInput value={dialogAccount?.account.currentBalance ?? 0} onChange={() => {}} disabled />
              </div>
            </div>
            {!isViewMode && (
              <p className="text-xs text-muted-foreground">
                Tipo e saldo inicial não podem ser alterados após a criação da conta.
              </p>
            )}
            <DialogFooter>
              {isViewMode ? (
                <Button type="button" variant="outline" onClick={() => setDialogAccount(null)}>
                  Fechar
                </Button>
              ) : (
                <Button onClick={handleUpdate} disabled={updateAccount.isPending || !editName.trim()}>
                  {updateAccount.isPending ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Contas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts?.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{AccountTypeLabels[account.type]}</TableCell>
                    <TableCell>{formatCurrency(account.currentBalance)}</TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RowActions
                        onView={() => openDialog(account, "view")}
                        onEdit={() => openDialog(account, "edit")}
                        onDelete={() => handleDelete(account)}
                        deleteConfirmMessage={`Excluir a conta "${account.name}"? Essa ação não pode ser desfeita.`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {accounts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma conta cadastrada.
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
