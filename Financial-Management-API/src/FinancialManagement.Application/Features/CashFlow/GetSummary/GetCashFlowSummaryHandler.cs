using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CashFlow.GetSummary;

public class GetCashFlowSummaryHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCashFlowSummaryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CashFlowSummaryResponse> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, type: null, cancellationToken);
        var settled = transactions.Where(t => t.IsSettled).ToList();

        var totalIncome = settled.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = settled.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

        var accounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);
        var currentBalance = accounts.Sum(a => a.CurrentBalance);

        var dailyBreakdown = settled
            .GroupBy(t => t.CompetenceDate.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DailyCashFlow(
                g.Key,
                g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount) - g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)))
            .ToList();

        return new CashFlowSummaryResponse(totalIncome, totalExpense, totalIncome - totalExpense, currentBalance, dailyBreakdown);
    }
}
