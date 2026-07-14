using FinancialManagement.Domain.Entities;

namespace FinancialManagement.Application.Features.Transactions;

public static class TransactionMapper
{
    public static TransactionResponse ToResponse(Transaction t) => new(
        t.Id, t.Description, t.Amount, t.Type, t.Status, t.AccountId, t.DestinationAccountId,
        t.CategoryId, t.CostCenterId, t.ClientName, t.CompetenceDate, t.SettlementDate,
        t.PaymentMethod, t.ExpenseNature, t.Recurrence, t.FeeAmount, t.NetAmount, t.ExpectedSettlementDate);
}
