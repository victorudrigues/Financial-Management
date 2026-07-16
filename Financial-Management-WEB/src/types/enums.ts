export enum AccountType {
  Dinheiro = 1,
  Caixa = 2,
  ContaCorrente = 3,
  ContaDigital = 4,
  Carteira = 5,
  Pix = 6,
}

export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.Dinheiro]: "Dinheiro",
  [AccountType.Caixa]: "Caixa",
  [AccountType.ContaCorrente]: "Conta Corrente",
  [AccountType.ContaDigital]: "Conta Digital",
  [AccountType.Carteira]: "Carteira",
  [AccountType.Pix]: "PIX",
};

export enum CategoryType {
  Receita = 1,
  Despesa = 2,
  Investimento = 3,
  Transferencia = 4,
}

export const CategoryTypeLabels: Record<CategoryType, string> = {
  [CategoryType.Receita]: "Receita",
  [CategoryType.Despesa]: "Despesa",
  [CategoryType.Investimento]: "Investimento",
  [CategoryType.Transferencia]: "Transferência",
};

export enum TransactionType {
  Entrada = 1,
  Saida = 2,
  Transferencia = 3,
}

export enum TransactionStatus {
  Pendente = 1,
  Recebido = 2,
  Pago = 3,
  Cancelado = 4,
  Estornado = 5,
}

export const TransactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.Pendente]: "Pendente",
  [TransactionStatus.Recebido]: "Recebido",
  [TransactionStatus.Pago]: "Pago",
  [TransactionStatus.Cancelado]: "Cancelado",
  [TransactionStatus.Estornado]: "Estornado",
};

export enum PaymentMethod {
  Dinheiro = 1,
  Debito = 2,
  Credito = 3,
  Pix = 4,
  Boleto = 5,
  Transferencia = 6,
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Dinheiro]: "Dinheiro",
  [PaymentMethod.Debito]: "Débito",
  [PaymentMethod.Credito]: "Crédito",
  [PaymentMethod.Pix]: "PIX",
  [PaymentMethod.Boleto]: "Boleto",
  [PaymentMethod.Transferencia]: "Transferência",
};

export enum ExpenseNature {
  Fixa = 1,
  Variavel = 2,
}

export const ExpenseNatureLabels: Record<ExpenseNature, string> = {
  [ExpenseNature.Fixa]: "Fixa",
  [ExpenseNature.Variavel]: "Variável",
};

export enum RecurrenceType {
  Nenhuma = 0,
  Semanal = 1,
  Mensal = 2,
  Anual = 3,
  Personalizada = 4,
}

export const RecurrenceTypeLabels: Record<RecurrenceType, string> = {
  [RecurrenceType.Nenhuma]: "Nenhuma",
  [RecurrenceType.Semanal]: "Semanal",
  [RecurrenceType.Mensal]: "Mensal",
  [RecurrenceType.Anual]: "Anual",
  [RecurrenceType.Personalizada]: "Personalizada",
};

export enum GoalType {
  Economizar = 1,
  AumentarFaturamento = 2,
  ReduzirDespesas = 3,
  CapitalizarCaixa = 4,
}

export const GoalTypeLabels: Record<GoalType, string> = {
  [GoalType.Economizar]: "Economizar",
  [GoalType.AumentarFaturamento]: "Aumentar Faturamento",
  [GoalType.ReduzirDespesas]: "Reduzir Despesas",
  [GoalType.CapitalizarCaixa]: "Capitalizar Caixa",
};

export enum CardBrand {
  MasterCard = 1,
  Elo = 2,
  Visa = 3,
}

export const CardBrandLabels: Record<CardBrand, string> = {
  [CardBrand.MasterCard]: "MasterCard",
  [CardBrand.Elo]: "Elo",
  [CardBrand.Visa]: "Visa",
};

export const Roles = {
  Administrador: "Administrador",
  Gerente: "Gerente",
  Operador: "Operador",
  Usuario: "Usuario",
} as const;
