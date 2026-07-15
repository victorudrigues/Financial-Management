"use client";

import { toast } from "sonner";
import { CheckCircle2, MoreHorizontal, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCancelTransaction, useConfirmTransaction, useReverseTransaction } from "@/features/transactions/api";
import { TransactionResponse } from "@/types/dtos";
import { TransactionStatus } from "@/types/enums";

export function TransactionActions({ transaction }: { transaction: TransactionResponse }) {
  const confirmTransaction = useConfirmTransaction();
  const cancelTransaction = useCancelTransaction();
  const reverseTransaction = useReverseTransaction();

  const isPending = transaction.status === TransactionStatus.Pendente;
  const isSettled = transaction.status === TransactionStatus.Recebido || transaction.status === TransactionStatus.Pago;

  if (!isPending && !isSettled) {
    return null;
  }

  async function handleConfirm() {
    try {
      await confirmTransaction.mutateAsync({ id: transaction.id, settlementDate: new Date().toISOString() });
      toast.success("Movimentação confirmada com sucesso.");
    } catch {
      toast.error("Não foi possível confirmar a movimentação.");
    }
  }

  async function handleCancel() {
    if (!window.confirm(`Cancelar "${transaction.description}"? A movimentação não será excluída, apenas marcada como cancelada.`)) return;
    try {
      await cancelTransaction.mutateAsync(transaction.id);
      toast.success("Movimentação cancelada com sucesso.");
    } catch {
      toast.error("Não foi possível cancelar a movimentação.");
    }
  }

  async function handleReverse() {
    if (!window.confirm(`Estornar "${transaction.description}"? O saldo da conta será revertido.`)) return;
    try {
      await reverseTransaction.mutateAsync(transaction.id);
      toast.success("Movimentação estornada com sucesso.");
    } catch {
      toast.error("Não foi possível estornar a movimentação.");
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
        {isPending && (
          <>
            <DropdownMenuItem onClick={handleConfirm}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleCancel}>
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </DropdownMenuItem>
          </>
        )}
        {isSettled && (
          <DropdownMenuItem variant="destructive" onClick={handleReverse}>
            <RotateCcw className="mr-2 h-4 w-4" /> Estornar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
