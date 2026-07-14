namespace FinancialManagement.Application.Features.CashFlow.GetSummary;

public record DailyCashFlow(DateTime Date, decimal Income, decimal Expense, decimal Balance);

public record CashFlowSummaryResponse(
    decimal TotalIncome,
    decimal TotalExpense,
    decimal NetFlow,
    decimal CurrentAccumulatedBalance,
    IReadOnlyList<DailyCashFlow> DailyBreakdown);
