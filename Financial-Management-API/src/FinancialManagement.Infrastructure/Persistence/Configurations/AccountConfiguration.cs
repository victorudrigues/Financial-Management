using FinancialManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialManagement.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name).IsRequired().HasMaxLength(150);
        builder.Property(a => a.InitialBalance).HasColumnType("decimal(18,2)");
        builder.Property(a => a.CurrentBalance).HasColumnType("decimal(18,2)");
        builder.Property(a => a.RowVersion).IsRowVersion();
    }
}
