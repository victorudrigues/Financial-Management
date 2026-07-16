using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.PaymentMachines.CalculateFee;

public record CalculateFeeRequest(
    Guid PaymentMachineId,
    decimal GrossAmount,
    PaymentMethod PaymentMethod,
    int Installments,
    CardBrand? CardBrand);
