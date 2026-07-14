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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateGoal, useGoals } from "@/features/goals/api";
import { GoalType, GoalTypeLabels } from "@/types/enums";
import { formatCurrency, formatDate, toIsoDate } from "@/lib/format";

const schema = z.object({
  name: z.string().min(1, "Informe o nome da meta."),
  type: z.number().int(),
  targetAmount: z.number().positive("O valor alvo deve ser maior que zero."),
  deadline: z.string().min(1, "Informe o prazo."),
});

type FormValues = z.infer<typeof schema>;

export function GoalsPage() {
  const [open, setOpen] = useState(false);
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();

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
      name: "",
      type: GoalType.Economizar,
      targetAmount: 0,
      deadline: toIsoDate(new Date(new Date().setMonth(new Date().getMonth() + 1))),
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createGoal.mutateAsync(values);
      toast.success("Meta criada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a meta.");
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={String(watch("type"))} onValueChange={(value) => setValue("type", Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GoalTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Valor Alvo</Label>
                  <Input id="targetAmount" type="number" step="0.01" {...register("targetAmount", { valueAsNumber: true })} />
                  {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input id="deadline" type="date" {...register("deadline")} />
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

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals?.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="text-base">{goal.name}</CardTitle>
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
