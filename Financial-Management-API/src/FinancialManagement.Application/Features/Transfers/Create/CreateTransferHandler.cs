using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;
using FinancialManagement.Application.Features.Transactions;

namespace FinancialManagement.Application.Features.Transfers.Create;

public class CreateTransferHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IDateTimeProvider _dateTimeProvider;

    public CreateTransferHandler(IUnitOfWork unitOfWork, IDateTimeProvider dateTimeProvider)
    {
        _unitOfWork = unitOfWork;
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<Result<TransactionResponse>> HandleAsync(CreateTransferRequest request, CancellationToken cancellationToken)
    {
        var source = await _unitOfWork.Accounts.GetByIdAsync(request.SourceAccountId, cancellationToken);
        if (source is null)
            return Result.Failure<TransactionResponse>("Conta de origem não encontrada.");

        var destination = await _unitOfWork.Accounts.GetByIdAsync(request.DestinationAccountId, cancellationToken);
        if (destination is null)
            return Result.Failure<TransactionResponse>("Conta de destino não encontrada.");

        Transaction transfer;
        try
        {
            transfer = Transaction.CreateTransfer(request.Amount, request.SourceAccountId, request.DestinationAccountId, request.CompetenceDate, request.Notes);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<TransactionResponse>(ex.Message);
        }

        transfer.Confirm(_dateTimeProvider.UtcNow);
        source.Debit(request.Amount);
        destination.Credit(request.Amount);

        await _unitOfWork.Transactions.AddAsync(transfer, cancellationToken);
        _unitOfWork.Accounts.Update(source);
        _unitOfWork.Accounts.Update(destination);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(TransactionMapper.ToResponse(transfer));
    }
}
