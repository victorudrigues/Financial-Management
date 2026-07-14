using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly FinancialManagementDbContext _context;

    public UnitOfWork(
        FinancialManagementDbContext context,
        IAccountRepository accounts,
        ICategoryRepository categories,
        ICostCenterRepository costCenters,
        IPaymentMachineRepository paymentMachines,
        ITransactionRepository transactions,
        IGoalRepository goals)
    {
        _context = context;
        Accounts = accounts;
        Categories = categories;
        CostCenters = costCenters;
        PaymentMachines = paymentMachines;
        Transactions = transactions;
        Goals = goals;
    }

    public IAccountRepository Accounts { get; }
    public ICategoryRepository Categories { get; }
    public ICostCenterRepository CostCenters { get; }
    public IPaymentMachineRepository PaymentMachines { get; }
    public ITransactionRepository Transactions { get; }
    public IGoalRepository Goals { get; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _context.SaveChangesAsync(cancellationToken);
}
