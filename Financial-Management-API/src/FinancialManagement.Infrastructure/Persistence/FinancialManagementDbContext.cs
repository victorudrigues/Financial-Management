using FinancialManagement.Domain.Entities;
using FinancialManagement.Infrastructure.Identity;
using FinancialManagement.SharedKernel.Common;
using FinancialManagement.SharedKernel.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinancialManagement.Infrastructure.Persistence;

public class FinancialManagementDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    private readonly ICurrentUserService? _currentUserService;

    public FinancialManagementDbContext(DbContextOptions<FinancialManagementDbContext> options, ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CostCenter> CostCenters => Set<CostCenter>();
    public DbSet<PaymentMachine> PaymentMachines => Set<PaymentMachine>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Goal> Goals => Set<Goal>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(FinancialManagementDbContext).Assembly);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (!typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                continue;

            var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
            var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
            var falseConstant = System.Linq.Expressions.Expression.Constant(false);
            var body = System.Linq.Expressions.Expression.Equal(property, falseConstant);
            var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);

            builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService?.UserId;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added when userId.HasValue:
                    entry.Entity.SetCreatedBy(userId.Value);
                    break;
                case EntityState.Modified:
                    entry.Entity.MarkUpdated(userId);
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.MarkDeleted(userId);
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
