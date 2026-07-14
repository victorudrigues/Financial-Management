using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Accounts.Update;

public class UpdateAccountHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAccountHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountResponse>> HandleAsync(Guid id, UpdateAccountRequest request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(id, cancellationToken);

        if (account is null)
            return Result.Failure<AccountResponse>("Conta não encontrada.");

        account.Rename(request.Name);
        _unitOfWork.Accounts.Update(account);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new AccountResponse(account.Id, account.Name, account.Type, account.InitialBalance, account.CurrentBalance, account.IsActive));
    }
}
