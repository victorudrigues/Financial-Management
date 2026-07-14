namespace FinancialManagement.Application.Features.PaymentMachines.CalculateFee;

public record CalculateFeeResponse(decimal GrossAmount, decimal FeeAmount, decimal NetAmount, DateTime ExpectedSettlementDate);
