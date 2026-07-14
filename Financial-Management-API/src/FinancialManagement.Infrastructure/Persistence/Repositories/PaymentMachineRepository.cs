using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class PaymentMachineRepository : Repository<PaymentMachine>, IPaymentMachineRepository
{
    public PaymentMachineRepository(FinancialManagementDbContext context) : base(context) { }
}
