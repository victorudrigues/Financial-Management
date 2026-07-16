namespace FinancialManagement.Application.Features.PaymentMachines.Create;

public record CreatePaymentMachineRequest(
    string Name,
    bool UnifiedFeeForAllBrands,
    List<BrandFeeRequest> BrandFees,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation);
