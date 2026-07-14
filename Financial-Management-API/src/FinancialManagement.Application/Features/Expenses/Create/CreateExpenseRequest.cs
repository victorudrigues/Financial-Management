using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Expenses.Create;

public record CreateExpenseRequest(
    string Description,
    decimal Amount,
    Guid AccountId,
    Guid CategoryId,
    DateTime CompetenceDate,
    PaymentMethod PaymentMethod,
    ExpenseNature ExpenseNature,
    RecurrenceType Recurrence,
    Guid? CostCenterId,
    string? Notes);
