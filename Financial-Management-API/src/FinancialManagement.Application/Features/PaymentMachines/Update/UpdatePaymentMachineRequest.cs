namespace FinancialManagement.Application.Features.PaymentMachines.Update;

public record UpdatePaymentMachineRequest(
    string Name,
    bool UnifiedFeeForAllBrands,
    List<BrandFeeRequest> BrandFees,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation);
