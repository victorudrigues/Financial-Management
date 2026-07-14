namespace FinancialManagement.Application.Features.PaymentMachines;

public record PaymentMachineResponse(
    Guid Id,
    string Name,
    decimal DebitFeePercent,
    decimal CreditFeePercent,
    decimal InstallmentFeePercent,
    decimal PixFeePercent,
    int SettlementDays,
    bool AllowsAnticipation,
    bool IsActive);
