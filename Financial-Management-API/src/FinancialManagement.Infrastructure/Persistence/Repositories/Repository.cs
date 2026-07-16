using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Entities;
using Microsoft.EntityFrameworkCore;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly FinancialManagementDbContext Context;
    protected readonly DbSet<T> Set;

    public Repository(FinancialManagementDbContext context)
    {
        Context = context;
        Set = context.Set<T>();
    }

    public virtual Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        Set.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public virtual Task<List<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Set.AsNoTracking().ToListAsync(cancellationToken);

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        await Set.AddAsync(entity, cancellationToken);

    public virtual void Update(T entity) => Set.Update(entity);

    public void Remove(T entity) => Set.Remove(entity);
}
