using FinancialManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialManagement.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Description).IsRequired().HasMaxLength(250);
        builder.Property(t => t.Amount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.FeeAmount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.NetAmount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.ClientName).HasMaxLength(150);
        builder.Property(t => t.Notes).HasMaxLength(1000);
        builder.Property(t => t.RowVersion).IsRowVersion();

        builder.HasIndex(t => t.CompetenceDate);
        builder.HasIndex(t => t.AccountId);
        builder.HasIndex(t => new { t.Type, t.Status });
    }
}
