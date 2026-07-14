using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.Accounts.GetAll;

public class GetAllAccountsHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllAccountsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AccountResponse>> HandleAsync(CancellationToken cancellationToken)
    {
        var accounts = await _unitOfWork.Accounts.GetAllAsync(cancellationToken);

        return accounts
            .Select(a => new AccountResponse(a.Id, a.Name, a.Type, a.InitialBalance, a.CurrentBalance, a.IsActive))
            .ToList();
    }
}
