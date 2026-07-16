namespace FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;

public record CostCenterBreakdownItem(
    Guid? CostCenterId,
    string CostCenterName,
    decimal IncomeAmount,
    decimal ExpenseAmount,
    int TransactionCount);
