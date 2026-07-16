using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class PaymentMachine : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public bool UnifiedFeeForAllBrands { get; private set; }
    public decimal PixFeePercent { get; private set; }
    public int SettlementDays { get; private set; }
    public bool AllowsAnticipation { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<PaymentMachineBrandFee> _brandFees = new();
    public IReadOnlyCollection<PaymentMachineBrandFee> BrandFees => _brandFees.AsReadOnly();

    private PaymentMachine() { }

    public PaymentMachine(
        string name,
        bool unifiedFeeForAllBrands,
        IReadOnlyCollection<BrandFeeSpec> brandFees,
        decimal pixFeePercent,
        int settlementDays,
        bool allowsAnticipation)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da maquineta é obrigatório.", nameof(name));

        if (settlementDays < 0)
            throw new ArgumentException("O prazo de recebimento não pode ser negativo.", nameof(settlementDays));

        Name = name;
        PixFeePercent = pixFeePercent;
        SettlementDays = settlementDays;
        AllowsAnticipation = allowsAnticipation;

        SetBrandFees(unifiedFeeForAllBrands, brandFees);
    }

    public void Update(
        string name,
        bool unifiedFeeForAllBrands,
        IReadOnlyCollection<BrandFeeSpec> brandFees,
        decimal pixFeePercent,
        int settlementDays,
        bool allowsAnticipation)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da maquineta é obrigatório.", nameof(name));

        Name = name;
        PixFeePercent = pixFeePercent;
        SettlementDays = settlementDays;
        AllowsAnticipation = allowsAnticipation;

        SetBrandFees(unifiedFeeForAllBrands, brandFees);
    }

    private void SetBrandFees(bool unifiedFeeForAllBrands, IReadOnlyCollection<BrandFeeSpec> brandFees)
    {
        if (brandFees.Count == 0)
            throw new ArgumentException("Selecione ao menos uma bandeira aceita.", nameof(brandFees));

        UnifiedFeeForAllBrands = unifiedFeeForAllBrands;
        _brandFees.Clear();

        foreach (var spec in brandFees)
        {
            _brandFees.Add(new PaymentMachineBrandFee(
                Id, spec.Brand, spec.DebitFeePercent, spec.CreditFeePercent, spec.InstallmentFeePercent));
        }
    }

    public void Deactivate() => IsActive = false;

    public void Activate() => IsActive = true;

    public FeeCalculationResult CalculateFee(
        decimal grossAmount,
        PaymentMethod method,
        int installments,
        DateTime referenceDate,
        CardBrand cardBrand = CardBrand.MasterCard)
    {
        if (grossAmount <= 0)
            throw new ArgumentException("O valor bruto deve ser positivo.", nameof(grossAmount));

        if (installments < 1)
            throw new ArgumentException("O número de parcelas deve ser ao menos 1.", nameof(installments));

        decimal feePercent;

        if (method == PaymentMethod.Pix)
        {
            feePercent = PixFeePercent;
        }
        else
        {
            var brandFee = _brandFees.FirstOrDefault(f => f.Brand == cardBrand)
                ?? throw new InvalidOperationException($"A maquineta \"{Name}\" não aceita a bandeira {cardBrand}.");

            feePercent = method switch
            {
                PaymentMethod.Debit => brandFee.DebitFeePercent,
                PaymentMethod.Credit => installments > 1 ? brandFee.InstallmentFeePercent : brandFee.CreditFeePercent,
                _ => 0m
            };
        }

        var feeAmount = Math.Round(grossAmount * feePercent / 100m, 2);
        var netAmount = grossAmount - feeAmount;
        var expectedSettlementDate = referenceDate.AddDays(SettlementDays);

        return new FeeCalculationResult(grossAmount, feeAmount, netAmount, expectedSettlementDate);
    }
}

public record BrandFeeSpec(CardBrand Brand, decimal DebitFeePercent, decimal CreditFeePercent, decimal InstallmentFeePercent);

public record FeeCalculationResult(decimal GrossAmount, decimal FeeAmount, decimal NetAmount, DateTime ExpectedSettlementDate);
