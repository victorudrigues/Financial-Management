using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.PaymentMachines;

public record PaymentMachineResponse(
    Guid Id,
    string Name,
    bool UnifiedFeeForAllBrands,
    List<BrandFeeResponse> BrandFees,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation,
    bool IsActive)
{
    public static PaymentMachineResponse FromEntity(PaymentMachine machine) => new(
        machine.Id,
        machine.Name,
        machine.UnifiedFeeForAllBrands,
        machine.BrandFees
            .Select(f => new BrandFeeResponse(f.Brand, f.DebitFeePercent, f.CreditFeePercent, f.InstallmentFeePercent))
            .ToList(),
        machine.PixFeePercent,
        machine.SettlementDays,
        machine.AllowsAnticipation,
        machine.IsActive);
}

public record BrandFeeResponse(CardBrand Brand, decimal DebitFeePercent, decimal CreditFeePercent, decimal InstallmentFeePercent);

public record BrandFeeRequest(CardBrand Brand, decimal DebitFeePercent, decimal CreditFeePercent, decimal InstallmentFeePercent);
