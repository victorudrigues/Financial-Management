using FinancialManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialManagement.Infrastructure.Persistence.Configurations;

public class PaymentMachineConfiguration : IEntityTypeConfiguration<PaymentMachine>
{
    public void Configure(EntityTypeBuilder<PaymentMachine> builder)
    {
        builder.ToTable("PaymentMachines");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(150);
        builder.Property(p => p.PixFeePercent).HasColumnType("decimal(5,2)");
        builder.Property(p => p.RowVersion).IsRowVersion();

        builder.HasMany(p => p.BrandFees)
            .WithOne()
            .HasForeignKey(f => f.PaymentMachineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.BrandFees)
            .HasField("_brandFees")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
