using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Accounts.GetById;

public class GetAccountByIdHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAccountByIdHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountResponse>> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(id, cancellationToken);

        if (account is null)
            return Result.Failure<AccountResponse>("Conta não encontrada.");

        return Result.Success(new AccountResponse(account.Id, account.Name, account.Type, account.InitialBalance, account.CurrentBalance, account.IsActive));
    }
}
