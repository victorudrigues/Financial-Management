using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.CashFlow.GetAccountBreakdown;

public record AccountBreakdownItem(
    Guid AccountId,
    string AccountName,
    AccountType AccountType,
    decimal CurrentBalance,
    decimal IncomeAmount,
    decimal ExpenseAmount,
    decimal TransferInAmount,
    decimal TransferOutAmount,
    int TransactionCount);
