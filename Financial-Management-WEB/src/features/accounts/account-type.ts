import { AccountType } from "@/types/enums";

export const CASH_ACCOUNT_TYPES = [AccountType.Dinheiro, AccountType.Caixa, AccountType.Carteira];

export function isCashAccountType(type: AccountType): boolean {
  return CASH_ACCOUNT_TYPES.includes(type);
}
