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
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/features/categories/api";
import { CategoryType, CategoryTypeLabels } from "@/types/enums";
import { CategoryResponse } from "@/types/dtos";

const categoryTypeOptions = Object.entries(CategoryTypeLabels).map(([value, label]) => ({ value, label }));

const schema = z.object({
  name: z.string().min(1, "Informe o nome da categoria."),
  type: z.number().int(),
});

type FormValues = z.infer<typeof schema>;

type DialogMode = "view" | "edit";

export function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<{ category: CategoryResponse; mode: DialogMode } | null>(null);
  const [editName, setEditName] = useState("");

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: CategoryType.Despesa },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createCategory.mutateAsync(values);
      toast.success("Categoria criada com sucesso.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Não foi possível criar a categoria.");
    }
  }

  function openDialog(category: CategoryResponse, mode: DialogMode) {
    setDialogCategory({ category, mode });
    setEditName(category.name);
  }

  async function handleUpdate() {
    if (!dialogCategory) return;
    try {
      await updateCategory.mutateAsync({ id: dialogCategory.category.id, name: editName, color: dialogCategory.category.color });
      toast.success("Categoria atualizada com sucesso.");
      setDialogCategory(null);
    } catch {
      toast.error("Não foi possível atualizar a categoria.");
    }
  }

  async function handleDelete(category: CategoryResponse) {
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Categoria excluída com sucesso.");
    } catch {
      toast.error("Não foi possível excluir a categoria. Verifique se não há movimentações vinculadas.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Organize receitas, despesas e investimentos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Categoria
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-type">Tipo</Label>
                <LabeledSelect
                  id="category-type"
                  value={String(watch("type"))}
                  onValueChange={(value) => setValue("type", Number(value))}
                  options={categoryTypeOptions}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!dialogCategory} onOpenChange={(isOpen) => !isOpen && setDialogCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogCategory?.mode === "view" ? "Detalhes da Categoria" : "Editar Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={dialogCategory?.mode === "view"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-category-type">Tipo</Label>
              <LabeledSelect
                id="view-category-type"
                value={dialogCategory ? String(dialogCategory.category.type) : ""}
                onValueChange={() => {}}
                options={categoryTypeOptions}
                disabled
              />
            </div>
            {dialogCategory?.mode === "edit" && (
              <p className="text-xs text-muted-foreground">O tipo não pode ser alterado após a criação da categoria.</p>
            )}
            <DialogFooter>
              {dialogCategory?.mode === "view" ? (
                <Button type="button" variant="outline" onClick={() => setDialogCategory(null)}>
                  Fechar
                </Button>
              ) : (
                <Button onClick={handleUpdate} disabled={updateCategory.isPending || !editName.trim()}>
                  {updateCategory.isPending ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Cadastradas</CardTitle>
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
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{CategoryTypeLabels[category.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <RowActions
                        onView={() => openDialog(category, "view")}
                        onEdit={() => openDialog(category, "edit")}
                        onDelete={() => handleDelete(category)}
                        deleteConfirmMessage={`Excluir a categoria "${category.name}"? Essa ação não pode ser desfeita.`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {categories?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhuma categoria cadastrada.
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
