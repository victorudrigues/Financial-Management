using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class GoalRepository : Repository<Goal>, IGoalRepository
{
    public GoalRepository(FinancialManagementDbContext context) : base(context) { }
}
