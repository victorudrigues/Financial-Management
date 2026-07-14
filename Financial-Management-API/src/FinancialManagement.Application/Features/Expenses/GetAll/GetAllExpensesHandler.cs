using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Expenses.GetAll;

public class GetAllExpensesHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllExpensesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TransactionResponse>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, TransactionType.Expense, cancellationToken);

        return transactions.Select(TransactionMapper.ToResponse).ToList();
    }
}
