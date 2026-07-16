using FinancialManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancialManagement.Infrastructure.Persistence.Configurations;

public class PaymentMachineBrandFeeConfiguration : IEntityTypeConfiguration<PaymentMachineBrandFee>
{
    public void Configure(EntityTypeBuilder<PaymentMachineBrandFee> builder)
    {
        builder.ToTable("PaymentMachineBrandFees");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.DebitFeePercent).HasColumnType("decimal(5,2)");
        builder.Property(f => f.CreditFeePercent).HasColumnType("decimal(5,2)");
        builder.Property(f => f.InstallmentFeePercent).HasColumnType("decimal(5,2)");
    }
}
