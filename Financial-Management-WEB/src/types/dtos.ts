import {
  AccountType,
  CategoryType,
  ExpenseNature,
  PaymentMethod,
  RecurrenceType,
  TransactionStatus,
  TransactionType,
  GoalType,
} from "./enums";

export interface AccountResponse {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  type: CategoryType;
  color?: string | null;
  parentCategoryId?: string | null;
}

export interface CostCenterResponse {
  id: string;
  name: string;
  description?: string | null;
}

export interface PaymentMachineResponse {
  id: string;
  name: string;
  debitFeePercent: number;
  creditFeePercent: number;
  installmentFeePercent: number;
  pixFeePercent: number;
  settlementDays: number;
  allowsAnticipation: boolean;
  isActive: boolean;
}

export interface TransactionResponse {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  accountId: string;
  destinationAccountId?: string | null;
  categoryId?: string | null;
  costCenterId?: string | null;
  clientName?: string | null;
  competenceDate: string;
  settlementDate?: string | null;
  paymentMethod: PaymentMethod;
  expenseNature?: ExpenseNature | null;
  recurrence: RecurrenceType;
  feeAmount?: number | null;
  netAmount?: number | null;
  expectedSettlementDate?: string | null;
}

export interface DailyCashFlow {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CashFlowSummaryResponse {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  currentAccumulatedBalance: number;
  dailyBreakdown: DailyCashFlow[];
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  categoryType: CategoryType;
  color?: string | null;
  totalAmount: number;
  transactionCount: number;
}

export interface CostCenterBreakdownItem {
  costCenterId?: string | null;
  costCenterName: string;
  totalAmount: number;
  transactionCount: number;
}

export interface DashboardOverviewResponse {
  currentBalance: number;
  todayIncome: number;
  todayExpense: number;
  projectedBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  profit: number;
  marginPercent: number;
  availableCapital: number;
}

export interface GoalResponse {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isAchieved: boolean;
  progressPercent: number;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface RegisterResponse {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface CheckEmailResponse {
  exists: boolean;
}
