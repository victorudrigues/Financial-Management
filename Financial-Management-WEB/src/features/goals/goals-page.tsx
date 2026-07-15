"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCreateGoal, useDeleteGoal, useGoals, useUpdateGoal } from "@/features/goals/api";
import { GoalResponse } from "@/types/dtos";
import { GoalType, GoalTypeLabels } from "@/types/enums";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

const goalTypeOptions = Object.entries(GoalTypeLabels).map(([value, label]) => ({ value, label }));

const schema = z.object({
  name: z.string().min(1, "Informe o nome da meta."),
  type: z.number().int(),
  targetAmount: z.number().positive("O valor alvo deve ser maior que zero."),
  deadline: z.string().min(1, "Informe o prazo."),
});

type FormValues = z.infer<typeof schema>;

function defaultDeadline() {
  return toIsoDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
}

type DialogMode = "view" | "edit";

export function GoalsPage() {
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("edit");

  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const createForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: GoalType.Economizar, targetAmount: 0, deadline: defaultDeadline() },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: GoalType.Economizar, targetAmount: 0, deadline: defaultDeadline() },
  });

  useEffect(() => {
    if (editingGoal) {
      editForm.reset({
        name: editingGoal.name,
        type: editingGoal.type,
        targetAmount: editingGoal.targetAmount,
        deadline: toIsoDate(new Date(editingGoal.deadline)),
      });
    }
  }, [editingGoal, editForm]);

  async function onCreate(values: FormValues) {
    try {
      await createGoal.mutateAsync(values);
      toast.success("Meta criada com sucesso.");
      createForm.reset({ name: "", type: GoalType.Economizar, targetAmount: 0, deadline: defaultDeadline() });
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a meta.");
    }
  }

  async function onUpdate(values: FormValues) {
    if (!editingGoal) return;
    try {
      await updateGoal.mutateAsync({ id: editingGoal.id, ...values });
      toast.success("Meta atualizada com sucesso.");
      setEditingGoal(null);
    } catch {
      toast.error("Não foi possível atualizar a meta.");
    }
  }

  async function handleDelete(goal: GoalResponse) {
    try {
      await deleteGoal.mutateAsync(goal.id);
      toast.success("Meta excluída com sucesso.");
    } catch {
      toast.error("Não foi possível excluir a meta.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">Metas financeiras e progresso.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Meta
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...createForm.register("name")} />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-type">Tipo</Label>
                <LabeledSelect
                  id="goal-type"
                  value={String(createForm.watch("type"))}
                  onValueChange={(value) => createForm.setValue("type", Number(value))}
                  options={goalTypeOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Valor Alvo</Label>
                  <CurrencyInput
                    id="targetAmount"
                    value={createForm.watch("targetAmount")}
                    onChange={(value) => createForm.setValue("targetAmount", value)}
                  />
                  {createForm.formState.errors.targetAmount && (
                    <p className="text-sm text-destructive">{createForm.formState.errors.targetAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input id="deadline" type="date" {...createForm.register("deadline")} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingGoal} onOpenChange={(isOpen) => !isOpen && setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "view" ? "Detalhes da Meta" : "Editar Meta"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onUpdate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goal-name">Nome</Label>
              <Input id="edit-goal-name" disabled={dialogMode === "view"} {...editForm.register("name")} />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-goal-type">Tipo</Label>
              <LabeledSelect
                id="edit-goal-type"
                value={String(editForm.watch("type"))}
                onValueChange={(value) => editForm.setValue("type", Number(value))}
                options={goalTypeOptions}
                disabled={dialogMode === "view"}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal-targetAmount">Valor Alvo</Label>
                <CurrencyInput
                  id="edit-goal-targetAmount"
                  value={editForm.watch("targetAmount")}
                  onChange={(value) => editForm.setValue("targetAmount", value)}
                  disabled={dialogMode === "view"}
                />
                {editForm.formState.errors.targetAmount && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.targetAmount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goal-deadline">Prazo</Label>
                <Input id="edit-goal-deadline" type="date" disabled={dialogMode === "view"} {...editForm.register("deadline")} />
              </div>
            </div>
            {dialogMode === "view" && (
              <div className="space-y-2">
                <Label>Valor Atual / Progresso</Label>
                <p className="text-sm font-medium">
                  {editingGoal ? formatCurrency(editingGoal.currentAmount) : "-"} ({editingGoal?.progressPercent ?? 0}%)
                </p>
              </div>
            )}
            <DialogFooter>
              {dialogMode === "view" ? (
                <Button type="button" variant="outline" onClick={() => setEditingGoal(null)}>
                  Fechar
                </Button>
              ) : (
                <Button type="submit" disabled={updateGoal.isPending}>
                  {updateGoal.isPending ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals?.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{goal.name}</CardTitle>
                <RowActions
                  onView={() => {
                    setDialogMode("view");
                    setEditingGoal(goal);
                  }}
                  onEdit={() => {
                    setDialogMode("edit");
                    setEditingGoal(goal);
                  }}
                  onDelete={() => handleDelete(goal)}
                  deleteConfirmMessage={`Excluir a meta "${goal.name}"? Essa ação não pode ser desfeita.`}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{GoalTypeLabels[goal.type]}</p>
                <p className="text-lg font-semibold">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Prazo: {formatDate(goal.deadline)}</p>
              </CardContent>
            </Card>
          ))}
          {goals?.length === 0 && <p className="text-muted-foreground">Nenhuma meta cadastrada.</p>}
        </div>
      )}
    </div>
  );
}
