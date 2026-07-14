using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Accounts.Delete;

public class DeleteAccountHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAccountHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(id, cancellationToken);

        if (account is null)
            return Result.Failure("Conta não encontrada.");

        _unitOfWork.Accounts.Remove(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
