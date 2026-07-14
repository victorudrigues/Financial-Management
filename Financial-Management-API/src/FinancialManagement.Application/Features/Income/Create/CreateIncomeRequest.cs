using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Income.Create;

public record CreateIncomeRequest(
    string Description,
    decimal Amount,
    Guid AccountId,
    Guid CategoryId,
    DateTime CompetenceDate,
    PaymentMethod PaymentMethod,
    string? ClientName,
    Guid? CostCenterId,
    string? Notes,
    Guid? PaymentMachineId,
    int? Installments);
