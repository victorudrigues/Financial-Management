"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountResponse, CategoryResponse, CostCenterResponse, TransactionResponse } from "@/types/dtos";
import {
  ExpenseNatureLabels,
  PaymentMethodLabels,
  RecurrenceTypeLabels,
  TransactionStatusLabels,
  TransactionType,
} from "@/types/enums";
import { formatCurrency, formatDate } from "@/lib/format";

interface TransactionDetailsDialogProps {
  transaction: TransactionResponse | null;
  onClose: () => void;
  accounts?: AccountResponse[];
  categories?: CategoryResponse[];
  costCenters?: CostCenterResponse[];
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function TransactionDetailsDialog({
  transaction,
  onClose,
  accounts,
  categories,
  costCenters,
}: TransactionDetailsDialogProps) {
  const account = accounts?.find((a) => a.id === transaction?.accountId);
  const category = categories?.find((c) => c.id === transaction?.categoryId);
  const costCenter = costCenters?.find((c) => c.id === transaction?.costCenterId);

  return (
    <Dialog open={!!transaction} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Movimentação</DialogTitle>
        </DialogHeader>
        {transaction && (
          <div className="space-y-0">
            <DetailRow label="Descrição" value={transaction.description} />
            <DetailRow label="Valor" value={formatCurrency(transaction.amount)} />
            <DetailRow
              label="Status"
              value={<Badge variant="outline">{TransactionStatusLabels[transaction.status]}</Badge>}
            />
            <DetailRow label="Conta" value={account?.name ?? "-"} />
            <DetailRow label="Categoria" value={category?.name ?? "-"} />
            <DetailRow label="Centro de Custo" value={costCenter?.name} />
            <DetailRow label="Data de Competência" value={formatDate(transaction.competenceDate)} />
            <DetailRow
              label="Data de Liquidação"
              value={transaction.settlementDate ? formatDate(transaction.settlementDate) : undefined}
            />
            <DetailRow label="Forma de Pagamento" value={PaymentMethodLabels[transaction.paymentMethod]} />
            <DetailRow label="Cliente" value={transaction.clientName} />
            {transaction.type === TransactionType.Saida && (
              <>
                <DetailRow
                  label="Natureza"
                  value={transaction.expenseNature ? ExpenseNatureLabels[transaction.expenseNature] : "-"}
                />
                <DetailRow label="Recorrência" value={RecurrenceTypeLabels[transaction.recurrence]} />
              </>
            )}
            <DetailRow
              label="Taxa da Maquineta"
              value={transaction.feeAmount ? formatCurrency(transaction.feeAmount) : undefined}
            />
            <DetailRow
              label="Valor Líquido"
              value={transaction.netAmount ? formatCurrency(transaction.netAmount) : undefined}
            />
            <DetailRow
              label="Previsão de Recebimento"
              value={transaction.expectedSettlementDate ? formatDate(transaction.expectedSettlementDate) : undefined}
            />
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
