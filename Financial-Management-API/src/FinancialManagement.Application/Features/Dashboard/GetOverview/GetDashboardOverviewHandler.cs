using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Dashboard.GetOverview;

public class GetDashboardOverviewHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTimeProvider;

    public GetDashboardOverviewHandler(IUnitOfWork unitOfWork, IDateTimeProvider dateTimeProvider)
    {
        _unitOfWork = unitOfWork;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<DashboardOverviewResponse> HandleAsync(CancellationToken cancellationToken)
    {
        var today = _dateTimeProvider.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);

        var accounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);
        var currentBalance = accounts.Sum(a => a.CurrentBalance);

        var monthTransactions = await _unitOfWork.Transactions.GetByPeriodAsync(monthStart, monthEnd, type: null, cancellationToken);
        var settledMonth = monthTransactions.Where(t => t.IsSettled).ToList();

        var monthlyIncome = settledMonth.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var monthlyExpense = settledMonth.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var todayIncome = settledMonth.Where(t => t.Type == TransactionType.Income && t.CompetenceDate.Date == today).Sum(t => t.Amount);
        var todayExpense = settledMonth.Where(t => t.Type == TransactionType.Expense && t.CompetenceDate.Date == today).Sum(t => t.Amount);

        var allTransactions = await _unitOfWork.Transactions.GetAllAsync(cancellationToken);
        var pending = allTransactions.Where(t => t.Status == TransactionStatus.Pending).ToList();
        var pendingIncome = pending.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var pendingExpense = pending.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var projectedBalance = currentBalance + pendingIncome - pendingExpense;
        var profit = monthlyIncome - monthlyExpense;
        var margin = monthlyIncome == 0 ? 0 : Math.Round(profit / monthlyIncome * 100m, 2);

        return new DashboardOverviewResponse(
            currentBalance, todayIncome, todayExpense, projectedBalance,
            monthlyIncome, monthlyExpense, profit, margin, currentBalance);
    }
}
