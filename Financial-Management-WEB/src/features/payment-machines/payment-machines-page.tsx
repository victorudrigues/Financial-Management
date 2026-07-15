"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useCreatePaymentMachine,
  useDeletePaymentMachine,
  usePaymentMachines,
  useUpdatePaymentMachine,
} from "@/features/payment-machines/api";
import { PaymentMachineResponse } from "@/types/dtos";
import { formatPercent } from "@/lib/format";

const schema = z.object({
  name: z.string().min(1, "Informe o nome."),
  debitFeePercent: z.number().min(0).max(100),
  creditFeePercent: z.number().min(0).max(100),
  installmentFeePercent: z.number().min(0).max(100),
  pixFeePercent: z.number().min(0).max(100),
  settlementDays: z.number().int().min(0),
  allowsAnticipation: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  debitFeePercent: 1.5,
  creditFeePercent: 3.5,
  installmentFeePercent: 4.5,
  pixFeePercent: 0.5,
  settlementDays: 1,
  allowsAnticipation: false,
};

function PaymentMachineFormFields({
  register,
  errors,
  idPrefix,
  disabled,
}: {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  idPrefix: string;
  disabled?: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
        <Input id={`${idPrefix}-name`} disabled={disabled} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-debitFeePercent`}>Taxa Débito (%)</Label>
          <Input id={`${idPrefix}-debitFeePercent`} type="number" step="0.01" disabled={disabled} {...register("debitFeePercent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-creditFeePercent`}>Taxa Crédito (%)</Label>
          <Input id={`${idPrefix}-creditFeePercent`} type="number" step="0.01" disabled={disabled} {...register("creditFeePercent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-installmentFeePercent`}>Taxa Parcelado (%)</Label>
          <Input id={`${idPrefix}-installmentFeePercent`} type="number" step="0.01" disabled={disabled} {...register("installmentFeePercent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-pixFeePercent`}>Taxa PIX (%)</Label>
          <Input id={`${idPrefix}-pixFeePercent`} type="number" step="0.01" disabled={disabled} {...register("pixFeePercent", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-settlementDays`}>Prazo de Recebimento (dias)</Label>
        <Input id={`${idPrefix}-settlementDays`} type="number" disabled={disabled} {...register("settlementDays", { valueAsNumber: true })} />
      </div>
      <div className="flex items-center gap-2">
        <input id={`${idPrefix}-allowsAnticipation`} type="checkbox" className="h-4 w-4" disabled={disabled} {...register("allowsAnticipation")} />
        <Label htmlFor={`${idPrefix}-allowsAnticipation`}>Permite antecipação</Label>
      </div>
    </>
  );
}

type DialogMode = "view" | "edit";

export function PaymentMachinesPage() {
  const [open, setOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<PaymentMachineResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("edit");

  const { data: machines, isLoading } = usePaymentMachines();
  const createMachine = useCreatePaymentMachine();
  const updateMachine = useUpdatePaymentMachine();
  const deleteMachine = useDeletePaymentMachine();

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });
  const editForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (editingMachine) {
      editForm.reset({
        name: editingMachine.name,
        debitFeePercent: editingMachine.debitFeePercent,
        creditFeePercent: editingMachine.creditFeePercent,
        installmentFeePercent: editingMachine.installmentFeePercent,
        pixFeePercent: editingMachine.pixFeePercent,
        settlementDays: editingMachine.settlementDays,
        allowsAnticipation: editingMachine.allowsAnticipation,
      });
    }
  }, [editingMachine, editForm]);

  async function onCreate(values: FormValues) {
    try {
      await createMachine.mutateAsync(values);
      toast.success("Maquineta cadastrada com sucesso.");
      createForm.reset(DEFAULT_VALUES);
      setOpen(false);
    } catch {
      toast.error("Não foi possível cadastrar a maquineta.");
    }
  }

  async function onUpdate(values: FormValues) {
    if (!editingMachine) return;
    try {
      await updateMachine.mutateAsync({ id: editingMachine.id, ...values });
      toast.success("Maquineta atualizada com sucesso.");
      setEditingMachine(null);
    } catch {
      toast.error("Não foi possível atualizar a maquineta.");
    }
  }

  async function handleDelete(machine: PaymentMachineResponse) {
    try {
      await deleteMachine.mutateAsync(machine.id);
      toast.success("Maquineta excluída com sucesso.");
    } catch {
      toast.error("Não foi possível excluir a maquineta.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maquinetas</h1>
          <p className="text-muted-foreground">Taxas e prazos de recebimento por maquineta.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Maquineta
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Maquineta</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <PaymentMachineFormFields register={createForm.register} errors={createForm.formState.errors} idPrefix="create" />
              <DialogFooter>
                <Button type="submit" disabled={createMachine.isPending}>
                  {createMachine.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingMachine} onOpenChange={(isOpen) => !isOpen && setEditingMachine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "view" ? "Detalhes da Maquineta" : "Editar Maquineta"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
            <PaymentMachineFormFields
              register={editForm.register}
              errors={editForm.formState.errors}
              idPrefix="edit"
              disabled={dialogMode === "view"}
            />
            <DialogFooter>
              {dialogMode === "view" ? (
                <Button type="button" variant="outline" onClick={() => setEditingMachine(null)}>
                  Fechar
                </Button>
              ) : (
                <Button type="submit" disabled={updateMachine.isPending}>
                  {updateMachine.isPending ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Maquinetas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Débito</TableHead>
                  <TableHead>Crédito</TableHead>
                  <TableHead>Parcelado</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines?.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{formatPercent(machine.debitFeePercent)}</TableCell>
                    <TableCell>{formatPercent(machine.creditFeePercent)}</TableCell>
                    <TableCell>{formatPercent(machine.installmentFeePercent)}</TableCell>
                    <TableCell>{formatPercent(machine.pixFeePercent)}</TableCell>
                    <TableCell>{machine.settlementDays} dias</TableCell>
                    <TableCell>
                      <RowActions
                        onView={() => {
                          setDialogMode("view");
                          setEditingMachine(machine);
                        }}
                        onEdit={() => {
                          setDialogMode("edit");
                          setEditingMachine(machine);
                        }}
                        onDelete={() => handleDelete(machine)}
                        deleteConfirmMessage={`Excluir a maquineta "${machine.name}"? Essa ação não pode ser desfeita.`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {machines?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma maquineta cadastrada.
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
