using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CashFlow.GetAccountBreakdown;

public class GetAccountBreakdownHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAccountBreakdownHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AccountBreakdownItem>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var accounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);

        if (accounts.Count == 0)
            return new List<AccountBreakdownItem>();

        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, type: null, cancellationToken);
        var settled = transactions.Where(t => t.IsSettled).ToList();

        return accounts
            .Select(account =>
            {
                var income = settled
                    .Where(t => t.AccountId == account.Id && t.Type == TransactionType.Income)
                    .Sum(t => t.Amount);
                var expense = settled
                    .Where(t => t.AccountId == account.Id && t.Type == TransactionType.Expense)
                    .Sum(t => t.Amount);
                var transferIn = settled
                    .Where(t => t.DestinationAccountId == account.Id && t.Type == TransactionType.Transfer)
                    .Sum(t => t.Amount);
                var transferOut = settled
                    .Where(t => t.AccountId == account.Id && t.Type == TransactionType.Transfer)
                    .Sum(t => t.Amount);
                var count = settled.Count(t => t.AccountId == account.Id || t.DestinationAccountId == account.Id);

                return new AccountBreakdownItem(
                    account.Id,
                    account.Name,
                    account.Type,
                    account.CurrentBalance,
                    income,
                    expense,
                    transferIn,
                    transferOut,
                    count);
            })
            .OrderByDescending(item => item.CurrentBalance)
            .ToList();
    }
}
