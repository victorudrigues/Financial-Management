using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class PaymentMachine : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public decimal DebitFeePercent { get; private set; }
    public decimal CreditFeePercent { get; private set; }
    public decimal InstallmentFeePercent { get; private set; }
    public decimal PixFeePercent { get; private set; }
    public int SettlementDays { get; private set; }
    public bool AllowsAnticipation { get; private set; }
    public bool IsActive { get; private set; } = true;

    private PaymentMachine() { }

    public PaymentMachine(
        string name,
        decimal debitFeePercent,
        decimal creditFeePercent,
        decimal installmentFeePercent,
        decimal pixFeePercent,
        int settlementDays,
        bool allowsAnticipation)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da maquineta é obrigatório.", nameof(name));

        if (settlementDays < 0)
            throw new ArgumentException("O prazo de recebimento não pode ser negativo.", nameof(settlementDays));

        Name = name;
        DebitFeePercent = debitFeePercent;
        CreditFeePercent = creditFeePercent;
        InstallmentFeePercent = installmentFeePercent;
        PixFeePercent = pixFeePercent;
        SettlementDays = settlementDays;
        AllowsAnticipation = allowsAnticipation;
    }

    public void Update(
        string name,
        decimal debitFeePercent,
        decimal creditFeePercent,
        decimal installmentFeePercent,
        decimal pixFeePercent,
        int settlementDays,
        bool allowsAnticipation)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da maquineta é obrigatório.", nameof(name));

        Name = name;
        DebitFeePercent = debitFeePercent;
        CreditFeePercent = creditFeePercent;
        InstallmentFeePercent = installmentFeePercent;
        PixFeePercent = pixFeePercent;
        SettlementDays = settlementDays;
        AllowsAnticipation = allowsAnticipation;
    }

    public void Deactivate() => IsActive = false;

    public void Activate() => IsActive = true;

    public FeeCalculationResult CalculateFee(decimal grossAmount, PaymentMethod method, int installments, DateTime referenceDate)
    {
        if (grossAmount <= 0)
            throw new ArgumentException("O valor bruto deve ser positivo.", nameof(grossAmount));

        if (installments < 1)
            throw new ArgumentException("O número de parcelas deve ser ao menos 1.", nameof(installments));

        var feePercent = method switch
        {
            PaymentMethod.Pix => PixFeePercent,
            PaymentMethod.Debit => DebitFeePercent,
            PaymentMethod.Credit => installments > 1 ? InstallmentFeePercent : CreditFeePercent,
            _ => 0m
        };

        var feeAmount = Math.Round(grossAmount * feePercent / 100m, 2);
        var netAmount = grossAmount - feeAmount;
        var expectedSettlementDate = referenceDate.AddDays(SettlementDays);

        return new FeeCalculationResult(grossAmount, feeAmount, netAmount, expectedSettlementDate);
    }
}

public record FeeCalculationResult(decimal GrossAmount, decimal FeeAmount, decimal NetAmount, DateTime ExpectedSettlementDate);
