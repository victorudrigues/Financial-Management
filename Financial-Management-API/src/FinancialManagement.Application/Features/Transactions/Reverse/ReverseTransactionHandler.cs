using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Transactions.Reverse;

public class ReverseTransactionHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public ReverseTransactionHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(id, cancellationToken);
        if (transaction is null)
            return Result.Failure("Movimentação não encontrada.");

        var account = await _unitOfWork.Accounts.GetByIdAsync(transaction.AccountId, cancellationToken);
        if (account is null)
            return Result.Failure("Conta não encontrada.");

        try
        {
            transaction.Reverse();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }

        switch (transaction.Type)
        {
            case TransactionType.Income:
                account.Debit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                break;

            case TransactionType.Expense:
                account.Credit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                break;

            case TransactionType.Transfer:
                if (transaction.DestinationAccountId is null)
                    return Result.Failure("Conta de destino não informada.");

                var destinationAccount = await _unitOfWork.Accounts.GetByIdAsync(transaction.DestinationAccountId.Value, cancellationToken);
                if (destinationAccount is null)
                    return Result.Failure("Conta de destino não encontrada.");

                account.Credit(transaction.Amount);
                destinationAccount.Debit(transaction.Amount);
                _unitOfWork.Accounts.Update(account);
                _unitOfWork.Accounts.Update(destinationAccount);
                break;
        }

        _unitOfWork.Transactions.Update(transaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
