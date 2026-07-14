using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class CostCenterRepository : Repository<CostCenter>, ICostCenterRepository
{
    public CostCenterRepository(FinancialManagementDbContext context) : base(context) { }
}
