using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FinancialManagement.Infrastructure.Persistence.Repositories;

public class PaymentMachineRepository : Repository<PaymentMachine>, IPaymentMachineRepository
{
    public PaymentMachineRepository(FinancialManagementDbContext context) : base(context) { }

    public override Task<PaymentMachine?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        Set.Include(p => p.BrandFees).FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public override Task<List<PaymentMachine>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Set.Include(p => p.BrandFees).AsNoTracking().OrderByDescending(p => p.CreatedAt).ToListAsync(cancellationToken);

    public override void Update(PaymentMachine entity)
    {
        // BrandFees is replaced wholesale on every update (see PaymentMachine.SetBrandFees).
        // New rows carry a client-generated Guid, so EF's graph fixup can't tell them apart
        // from existing rows unless we mark the not-yet-tracked ones as Added explicitly.
        foreach (var brandFee in entity.BrandFees)
        {
            var entry = Context.Entry(brandFee);
            if (entry.State == EntityState.Detached)
                entry.State = EntityState.Added;
        }
    }
}
