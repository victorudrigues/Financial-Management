using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Domain.Repositories;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<List<Transaction>> GetByPeriodAsync(DateTime from, DateTime to, TransactionType? type = null, CancellationToken cancellationToken = default);
    Task<List<Transaction>> GetPendingRecurringAsync(CancellationToken cancellationToken = default);
}
