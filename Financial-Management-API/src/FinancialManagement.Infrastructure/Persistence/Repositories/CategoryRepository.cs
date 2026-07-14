using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(FinancialManagementDbContext context) : base(context) { }
}
