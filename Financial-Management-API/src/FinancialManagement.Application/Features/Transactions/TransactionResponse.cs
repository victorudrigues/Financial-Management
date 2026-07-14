using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Transactions;

public record TransactionResponse(
    Guid Id,
    string Description,
    decimal Amount,
    TransactionType Type,
    TransactionStatus Status,
    Guid AccountId,
    Guid? DestinationAccountId,
    Guid? CategoryId,
    Guid? CostCenterId,
    string? ClientName,
    DateTime CompetenceDate,
    DateTime? SettlementDate,
    PaymentMethod PaymentMethod,
    ExpenseNature? ExpenseNature,
    RecurrenceType Recurrence,
    decimal? FeeAmount,
    decimal? NetAmount,
    DateTime? ExpectedSettlementDate);
