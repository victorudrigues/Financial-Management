namespace FinancialManagement.Application.Features.Dashboard.GetOverview;

public record DashboardOverviewResponse(
    decimal CurrentBalance,
    decimal TodayIncome,
    decimal TodayExpense,
    decimal ProjectedBalance,
    decimal MonthlyIncome,
    decimal MonthlyExpense,
    decimal Profit,
    decimal MarginPercent,
    decimal AvailableCapital);
