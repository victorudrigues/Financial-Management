"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Info, Plus, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RowActions } from "@/components/row-actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BrandFeeInput,
  useCreatePaymentMachine,
  useDeletePaymentMachine,
  usePaymentMachines,
  useSetPaymentMachineActive,
  useUpdatePaymentMachine,
} from "@/features/payment-machines/api";
import { PaymentMachineResponse } from "@/types/dtos";
import { CardBrand, CardBrandLabels } from "@/types/enums";
import { formatPercent } from "@/lib/format";

const CARD_BRAND_OPTIONS = [CardBrand.MasterCard, CardBrand.Elo, CardBrand.Visa];

interface BrandFeeValues {
  debitFeePercent: number;
  creditFeePercent: number;
  installmentFeePercent: number;
}

interface BrandFeeState {
  acceptedBrands: CardBrand[];
  unifiedFeeForAllBrands: boolean;
  unifiedFees: BrandFeeValues;
  brandFees: Record<CardBrand, BrandFeeValues>;
}

const DEFAULT_BRAND_FEE: BrandFeeValues = { debitFeePercent: 1.5, creditFeePercent: 3.5, installmentFeePercent: 4.5 };

const DEFAULT_BRAND_STATE: BrandFeeState = {
  acceptedBrands: [CardBrand.MasterCard],
  unifiedFeeForAllBrands: true,
  unifiedFees: { ...DEFAULT_BRAND_FEE },
  brandFees: {
    [CardBrand.MasterCard]: { ...DEFAULT_BRAND_FEE },
    [CardBrand.Elo]: { ...DEFAULT_BRAND_FEE },
    [CardBrand.Visa]: { ...DEFAULT_BRAND_FEE },
  },
};

function FeePercentInputs({
  idPrefix,
  values,
  disabled,
  onChange,
}: {
  idPrefix: string;
  values: BrandFeeValues;
  disabled?: boolean;
  onChange: (field: keyof BrandFeeValues, value: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-debit`}>Débito (%)</Label>
        <Input
          id={`${idPrefix}-debit`}
          type="number"
          step="0.01"
          disabled={disabled}
          value={values.debitFeePercent}
          onChange={(e) => onChange("debitFeePercent", Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-credit`}>Crédito (%)</Label>
        <Input
          id={`${idPrefix}-credit`}
          type="number"
          step="0.01"
          disabled={disabled}
          value={values.creditFeePercent}
          onChange={(e) => onChange("creditFeePercent", Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-installment`}>Parcelado (%)</Label>
        <Input
          id={`${idPrefix}-installment`}
          type="number"
          step="0.01"
          disabled={disabled}
          value={values.installmentFeePercent}
          onChange={(e) => onChange("installmentFeePercent", Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function BrandFeesEditor({
  value,
  onChange,
  disabled,
  idPrefix,
}: {
  value: BrandFeeState;
  onChange: (next: BrandFeeState) => void;
  disabled?: boolean;
  idPrefix: string;
}) {
  function toggleBrand(brand: CardBrand) {
    const isSelected = value.acceptedBrands.includes(brand);
    onChange({
      ...value,
      acceptedBrands: isSelected
        ? value.acceptedBrands.filter((b) => b !== brand)
        : [...value.acceptedBrands, brand],
    });
  }

  function updateFees(target: "unified" | CardBrand, field: keyof BrandFeeValues, numericValue: number) {
    if (target === "unified") {
      onChange({ ...value, unifiedFees: { ...value.unifiedFees, [field]: numericValue } });
    } else {
      onChange({
        ...value,
        brandFees: { ...value.brandFees, [target]: { ...value.brandFees[target], [field]: numericValue } },
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Bandeiras aceitas</Label>
        <div className="flex flex-wrap gap-4">
          {CARD_BRAND_OPTIONS.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                disabled={disabled}
                checked={value.acceptedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              {CardBrandLabels[brand]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id={`${idPrefix}-unified`}
          type="checkbox"
          className="h-4 w-4"
          disabled={disabled}
          checked={value.unifiedFeeForAllBrands}
          onChange={(e) => onChange({ ...value, unifiedFeeForAllBrands: e.target.checked })}
        />
        <Label htmlFor={`${idPrefix}-unified`}>Cobrança única (para todas as bandeiras)</Label>
        <Tooltip>
          <TooltipTrigger
            render={
              <button type="button" className="text-muted-foreground">
                <Info className="h-4 w-4" />
              </button>
            }
          />
          <TooltipContent>
            Usa a mesma taxa de débito, crédito e parcelado para todas as bandeiras aceitas, em vez de
            configurar uma taxa diferente para cada bandeira (MasterCard, Elo, Visa).
          </TooltipContent>
        </Tooltip>
      </div>

      {value.unifiedFeeForAllBrands ? (
        <FeePercentInputs
          idPrefix={`${idPrefix}-unified`}
          values={value.unifiedFees}
          disabled={disabled}
          onChange={(field, numericValue) => updateFees("unified", field, numericValue)}
        />
      ) : value.acceptedBrands.length === 0 ? (
        <p className="text-sm text-muted-foreground">Selecione ao menos uma bandeira para configurar as taxas.</p>
      ) : (
        <div className="space-y-3">
          {value.acceptedBrands.map((brand) => (
            <div key={brand} className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">{CardBrandLabels[brand]}</p>
              <FeePercentInputs
                idPrefix={`${idPrefix}-${brand}`}
                values={value.brandFees[brand]}
                disabled={disabled}
                onChange={(field, numericValue) => updateFees(brand, field, numericValue)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const schema = z.object({
  name: z.string().min(1, "Informe o nome."),
  pixFeePercent: z.number().min(0).max(100),
  settlementDays: z.number().int().min(0),
  allowsAnticipation: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  name: "",
  pixFeePercent: 0.5,
  settlementDays: 1,
  allowsAnticipation: false,
};

function PaymentMachineFormFields({
  register,
  errors,
  idPrefix,
  disabled,
  brandState,
  onBrandStateChange,
}: {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  idPrefix: string;
  disabled?: boolean;
  brandState: BrandFeeState;
  onBrandStateChange: (next: BrandFeeState) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Nome</Label>
        <Input id={`${idPrefix}-name`} disabled={disabled} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <BrandFeesEditor value={brandState} onChange={onBrandStateChange} disabled={disabled} idPrefix={idPrefix} />

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-pixFeePercent`}>Taxa PIX (%)</Label>
        <Input
          id={`${idPrefix}-pixFeePercent`}
          type="number"
          step="0.01"
          disabled={disabled}
          {...register("pixFeePercent", { valueAsNumber: true })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-settlementDays`}>Prazo de Recebimento (dias)</Label>
        <Input
          id={`${idPrefix}-settlementDays`}
          type="number"
          disabled={disabled}
          {...register("settlementDays", { valueAsNumber: true })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id={`${idPrefix}-allowsAnticipation`}
          type="checkbox"
          className="h-4 w-4"
          disabled={disabled}
          {...register("allowsAnticipation")}
        />
        <Label htmlFor={`${idPrefix}-allowsAnticipation`}>Permite antecipação</Label>
      </div>
    </>
  );
}

function buildBrandFees(state: BrandFeeState): BrandFeeInput[] {
  return state.acceptedBrands.map((brand) => ({
    brand,
    ...(state.unifiedFeeForAllBrands ? state.unifiedFees : state.brandFees[brand]),
  }));
}

type DialogMode = "view" | "edit";

export function PaymentMachinesPage() {
  const [open, setOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<PaymentMachineResponse | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("edit");
  const [createBrandState, setCreateBrandState] = useState<BrandFeeState>(DEFAULT_BRAND_STATE);
  const [editBrandState, setEditBrandState] = useState<BrandFeeState>(DEFAULT_BRAND_STATE);

  const { data: machines, isLoading } = usePaymentMachines();
  const createMachine = useCreatePaymentMachine();
  const updateMachine = useUpdatePaymentMachine();
  const deleteMachine = useDeletePaymentMachine();
  const setActiveMachine = useSetPaymentMachineActive();

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });
  const editForm = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (editingMachine) {
      editForm.reset({
        name: editingMachine.name,
        pixFeePercent: editingMachine.pixFeePercent,
        settlementDays: editingMachine.settlementDays,
        allowsAnticipation: editingMachine.allowsAnticipation,
      });

      const brandFees = { ...DEFAULT_BRAND_STATE.brandFees };
      editingMachine.brandFees.forEach((fee) => {
        brandFees[fee.brand] = {
          debitFeePercent: fee.debitFeePercent,
          creditFeePercent: fee.creditFeePercent,
          installmentFeePercent: fee.installmentFeePercent,
        };
      });

      const firstFee = editingMachine.brandFees[0];

      setEditBrandState({
        acceptedBrands: editingMachine.brandFees.map((f) => f.brand),
        unifiedFeeForAllBrands: editingMachine.unifiedFeeForAllBrands,
        unifiedFees: firstFee
          ? {
              debitFeePercent: firstFee.debitFeePercent,
              creditFeePercent: firstFee.creditFeePercent,
              installmentFeePercent: firstFee.installmentFeePercent,
            }
          : { ...DEFAULT_BRAND_FEE },
        brandFees,
      });
    }
  }, [editingMachine, editForm]);

  async function onCreate(values: FormValues) {
    if (createBrandState.acceptedBrands.length === 0) {
      toast.error("Selecione ao menos uma bandeira aceita.");
      return;
    }
    try {
      await createMachine.mutateAsync({
        name: values.name,
        unifiedFeeForAllBrands: createBrandState.unifiedFeeForAllBrands,
        brandFees: buildBrandFees(createBrandState),
        pixFeePercent: values.pixFeePercent,
        settlementDays: values.settlementDays,
        allowsAnticipation: values.allowsAnticipation,
      });
      toast.success("Maquineta cadastrada com sucesso.");
      createForm.reset(DEFAULT_VALUES);
      setCreateBrandState(DEFAULT_BRAND_STATE);
      setOpen(false);
    } catch {
      toast.error("Não foi possível cadastrar a maquineta.");
    }
  }

  async function onUpdate(values: FormValues) {
    if (!editingMachine) return;
    if (editBrandState.acceptedBrands.length === 0) {
      toast.error("Selecione ao menos uma bandeira aceita.");
      return;
    }
    try {
      await updateMachine.mutateAsync({
        id: editingMachine.id,
        name: values.name,
        unifiedFeeForAllBrands: editBrandState.unifiedFeeForAllBrands,
        brandFees: buildBrandFees(editBrandState),
        pixFeePercent: values.pixFeePercent,
        settlementDays: values.settlementDays,
        allowsAnticipation: values.allowsAnticipation,
      });
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
      toast.error("Não foi possível excluir a maquineta. Verifique se ela está desativada.");
    }
  }

  async function handleToggleActive(machine: PaymentMachineResponse) {
    try {
      await setActiveMachine.mutateAsync({ id: machine.id, isActive: !machine.isActive });
      toast.success(machine.isActive ? "Maquineta desativada." : "Maquineta ativada.");
    } catch {
      toast.error("Não foi possível alterar o status da maquineta.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Maquinetas</h1>
          <p className="text-muted-foreground">Taxas e prazos de recebimento por maquineta e bandeira.</p>
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
              <PaymentMachineFormFields
                register={createForm.register}
                errors={createForm.formState.errors}
                idPrefix="create"
                brandState={createBrandState}
                onBrandStateChange={setCreateBrandState}
              />
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
              brandState={editBrandState}
              onBrandStateChange={setEditBrandState}
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
                  <TableHead>Bandeiras</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines?.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.name}</TableCell>
                    <TableCell>{machine.brandFees.map((f) => CardBrandLabels[f.brand]).join(", ")}</TableCell>
                    <TableCell>{formatPercent(machine.pixFeePercent)}</TableCell>
                    <TableCell>{machine.settlementDays} dias</TableCell>
                    <TableCell>
                      <Badge variant={machine.isActive ? "default" : "secondary"}>
                        {machine.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
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
                        extraItems={
                          <DropdownMenuItem onClick={() => handleToggleActive(machine)}>
                            {machine.isActive ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" /> Desativar
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" /> Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                        }
                      />
                    </TableCell>
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
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell colSpan={4} className="font-semibold">
                    {machines?.length ?? 0} maquineta(s) cadastrada(s)
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
