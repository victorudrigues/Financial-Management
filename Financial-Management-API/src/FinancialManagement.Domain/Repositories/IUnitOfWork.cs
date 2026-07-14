namespace FinancialManagement.Domain.Repositories;

public interface IUnitOfWork
{
    IAccountRepository Accounts { get; }
    ICategoryRepository Categories { get; }
    ICostCenterRepository CostCenters { get; }
    IPaymentMachineRepository PaymentMachines { get; }
    ITransactionRepository Transactions { get; }
    IGoalRepository Goals { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
