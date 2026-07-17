using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Transfers.GetAll;

public class GetAllTransfersHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllTransfersHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TransactionResponse>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, TransactionType.Transfer, cancellationToken);

        return transactions.Select(TransactionMapper.ToResponse).ToList();
    }
}
