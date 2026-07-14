using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Transactions.Confirm;

public class ConfirmTransactionHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmTransactionHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TransactionResponse>> HandleAsync(Guid id, ConfirmTransactionRequest request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(id, cancellationToken);
        if (transaction is null)
            return Result.Failure<TransactionResponse>("Movimentação não encontrada.");

        var account = await _unitOfWork.Accounts.GetByIdAsync(transaction.AccountId, cancellationToken);
        if (account is null)
            return Result.Failure<TransactionResponse>("Conta não encontrada.");

        transaction.Confirm(request.SettlementDate);

        switch (transaction.Type)
        {
            case TransactionType.Income:
                account.Credit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                break;

            case TransactionType.Expense:
                account.Debit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                break;

            case TransactionType.Transfer:
                if (transaction.DestinationAccountId is null)
                    return Result.Failure<TransactionResponse>("Conta de destino não informada.");

                var destinationAccount = await _unitOfWork.Accounts.GetByIdAsync(transaction.DestinationAccountId.Value, cancellationToken);
                if (destinationAccount is null)
                    return Result.Failure<TransactionResponse>("Conta de destino não encontrada.");

                account.Debit(transaction.Amount);
                destinationAccount.Credit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                _unitOfWork.Accounts.Update(destinationAccount);
                break;
        }

        _unitOfWork.Transactions.Update(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(TransactionMapper.ToResponse(transaction));
    }
}
