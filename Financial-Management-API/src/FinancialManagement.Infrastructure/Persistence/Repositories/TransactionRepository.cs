using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    public TransactionRepository(FinancialManagementDbContext context) : base(context) { }

    public Task<List<Transaction>> GetByPeriodAsync(DateTime from, DateTime to, TransactionType? type = null, CancellationToken cancellationToken = default)
    {
        var query = Set.AsNoTracking().Where(t => t.CompetenceDate >= from && t.CompetenceDate <= to);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        return query.OrderByDescending(t => t.CreatedAt).ToListAsync(cancellationToken);
    }

    public Task<List<Transaction>> GetPendingRecurringAsync(CancellationToken cancellationToken = default) =>
        Set.Where(t => t.Recurrence != RecurrenceType.None && t.Status == TransactionStatus.Pending)
            .ToListAsync(cancellationToken);
}
