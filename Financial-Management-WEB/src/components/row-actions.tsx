"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirmMessage?: string;
  extraItems?: React.ReactNode;
}

export function RowActions({ onEdit, onDelete, deleteConfirmMessage, extraItems }: RowActionsProps) {
  function handleDelete() {
    if (!onDelete) return;
    if (window.confirm(deleteConfirmMessage ?? "Tem certeza que deseja excluir este item?")) {
      onDelete();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Ações">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {extraItems}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
