namespace FinancialManagement.Application.Features.PaymentMachines.Update;

public record UpdatePaymentMachineRequest(
    string Name,
    decimal DebitFeePercent,
    decimal CreditFeePercent,
    decimal InstallmentFeePercent,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation);
