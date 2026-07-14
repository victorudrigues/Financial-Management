using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Accounts.Create;

public class CreateAccountHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateAccountHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AccountResponse>> HandleAsync(CreateAccountRequest request, CancellationToken cancellationToken)
    {
        var account = new Account(request.Name, request.Type, request.InitialBalance);

        await _unitOfWork.Accounts.AddAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new AccountResponse(account.Id, account.Name, account.Type, account.InitialBalance, account.CurrentBalance, account.IsActive));
    }
}
