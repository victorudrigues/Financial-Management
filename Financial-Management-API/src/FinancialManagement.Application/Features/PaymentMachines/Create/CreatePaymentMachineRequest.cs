namespace FinancialManagement.Application.Features.PaymentMachines.Create;

public record CreatePaymentMachineRequest(
    string Name,
    decimal DebitFeePercent,
    decimal CreditFeePercent,
    decimal InstallmentFeePercent,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation);
