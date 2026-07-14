using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class AccountRepository : Repository<Account>, IAccountRepository
{
    public AccountRepository(FinancialManagementDbContext context) : base(context) { }
}
