using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Income.GetAll;

public class GetAllIncomeHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllIncomeHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TransactionResponse>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, TransactionType.Income, cancellationToken);

        return transactions.Select(TransactionMapper.ToResponse).ToList();
    }
}
