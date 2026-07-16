using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Domain.Entities;

public class PaymentMachineBrandFee
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid PaymentMachineId { get; private set; }
    public CardBrand Brand { get; private set; }
    public decimal DebitFeePercent { get; private set; }
    public decimal CreditFeePercent { get; private set; }
    public decimal InstallmentFeePercent { get; private set; }

    private PaymentMachineBrandFee() { }

    public PaymentMachineBrandFee(
        Guid paymentMachineId,
        CardBrand brand,
        decimal debitFeePercent,
        decimal creditFeePercent,
        decimal installmentFeePercent)
    {
        PaymentMachineId = paymentMachineId;
        Brand = brand;
        DebitFeePercent = debitFeePercent;
        CreditFeePercent = creditFeePercent;
        InstallmentFeePercent = installmentFeePercent;
    }
}
