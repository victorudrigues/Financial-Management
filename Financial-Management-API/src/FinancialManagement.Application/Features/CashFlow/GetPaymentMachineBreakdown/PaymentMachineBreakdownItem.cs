namespace FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;

public record PaymentMachineBreakdownItem(
    Guid PaymentMachineId,
    string PaymentMachineName,
    decimal GrossAmount,
    decimal FeeAmount,
    decimal NetAmount,
    int TransactionCount);
