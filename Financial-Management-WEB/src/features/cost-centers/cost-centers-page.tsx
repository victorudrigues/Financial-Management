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
import { RowActions } from "@/components/row-actions";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCostCenters, useCreateCostCenter, useDeleteCostCenter, useUpdateCostCenter } from "@/features/cost-centers/api";
import { CostCenterResponse } from "@/types/dtos";

const schema = z.object({
  name: z.string().min(1, "Informe o nome."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CostCentersPage() {
  const [open, setOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenterResponse | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: costCenters, isLoading } = useCostCenters();
  const createCostCenter = useCreateCostCenter();
  const updateCostCenter = useUpdateCostCenter();
  const deleteCostCenter = useDeleteCostCenter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", description: "" } });

  async function onSubmit(values: FormValues) {
    try {
      await createCostCenter.mutateAsync(values);
      toast.success("Centro de custo criado com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar o centro de custo.");
    }
  }

  function openEdit(costCenter: CostCenterResponse) {
    setEditingCostCenter(costCenter);
    setEditName(costCenter.name);
    setEditDescription(costCenter.description ?? "");
  }

  async function handleUpdate() {
    if (!editingCostCenter) return;
    try {
      await updateCostCenter.mutateAsync({ id: editingCostCenter.id, name: editName, description: editDescription });
      toast.success("Centro de custo atualizado com sucesso.");
      setEditingCostCenter(null);
    } catch {
      toast.error("Não foi possível atualizar o centro de custo.");
    }
  }

  async function handleDelete(costCenter: CostCenterResponse) {
    try {
      await deleteCostCenter.mutateAsync(costCenter.id);
      toast.success("Centro de custo excluído com sucesso.");
    } catch {
      toast.error("Não foi possível excluir o centro de custo. Verifique se não há movimentações vinculadas.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Centros de Custo</h1>
          <p className="text-muted-foreground">Agrupe despesas por área ou departamento.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Novo Centro de Custo
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Centro de Custo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" {...register("description")} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCostCenter.isPending}>
                  {createCostCenter.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingCostCenter} onOpenChange={(isOpen) => !isOpen && setEditingCostCenter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Centro de Custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} disabled={updateCostCenter.isPending || !editName.trim()}>
                {updateCostCenter.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Centros de Custo Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenters?.map((costCenter) => (
                  <TableRow key={costCenter.id}>
                    <TableCell className="font-medium">{costCenter.name}</TableCell>
                    <TableCell>{costCenter.description ?? "-"}</TableCell>
                    <TableCell>
                      <RowActions
                        onEdit={() => openEdit(costCenter)}
                        onDelete={() => handleDelete(costCenter)}
                        deleteConfirmMessage={`Excluir o centro de custo "${costCenter.name}"? Essa ação não pode ser desfeita.`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {costCenters?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum centro de custo cadastrado.
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
