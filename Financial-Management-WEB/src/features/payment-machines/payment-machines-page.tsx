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
import { useCreatePaymentMachine, usePaymentMachines } from "@/features/payment-machines/api";
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

export function PaymentMachinesPage() {
  const [open, setOpen] = useState(false);
  const { data: machines, isLoading } = usePaymentMachines();
  const createMachine = useCreatePaymentMachine();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      debitFeePercent: 1.5,
      creditFeePercent: 3.5,
      installmentFeePercent: 4.5,
      pixFeePercent: 0.5,
      settlementDays: 1,
      allowsAnticipation: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createMachine.mutateAsync(values);
      toast.success("Maquineta cadastrada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível cadastrar a maquineta.");
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debitFeePercent">Taxa Débito (%)</Label>
                  <Input id="debitFeePercent" type="number" step="0.01" {...register("debitFeePercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditFeePercent">Taxa Crédito (%)</Label>
                  <Input id="creditFeePercent" type="number" step="0.01" {...register("creditFeePercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installmentFeePercent">Taxa Parcelado (%)</Label>
                  <Input id="installmentFeePercent" type="number" step="0.01" {...register("installmentFeePercent", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pixFeePercent">Taxa PIX (%)</Label>
                  <Input id="pixFeePercent" type="number" step="0.01" {...register("pixFeePercent", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settlementDays">Prazo de Recebimento (dias)</Label>
                <Input id="settlementDays" type="number" {...register("settlementDays", { valueAsNumber: true })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="allowsAnticipation" type="checkbox" className="h-4 w-4" {...register("allowsAnticipation")} />
                <Label htmlFor="allowsAnticipation">Permite antecipação</Label>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMachine.isPending}>
                  {createMachine.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  </TableRow>
                ))}
                {machines?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
