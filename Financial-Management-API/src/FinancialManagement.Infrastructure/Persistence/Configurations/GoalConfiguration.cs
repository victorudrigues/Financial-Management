using FinancialManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialManagement.Infrastructure.Persistence.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.ToTable("Goals");
        builder.HasKey(g => g.Id);

        builder.Property(g => g.Name).IsRequired().HasMaxLength(150);
        builder.Property(g => g.TargetAmount).HasColumnType("decimal(18,2)");
        builder.Property(g => g.CurrentAmount).HasColumnType("decimal(18,2)");
        builder.Property(g => g.RowVersion).IsRowVersion();
    }
}
