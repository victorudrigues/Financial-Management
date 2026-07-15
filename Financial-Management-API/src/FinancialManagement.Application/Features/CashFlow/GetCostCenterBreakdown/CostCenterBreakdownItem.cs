namespace FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;

public record CostCenterBreakdownItem(
    Guid? CostCenterId,
    string CostCenterName,
    decimal TotalAmount,
    int TransactionCount);
