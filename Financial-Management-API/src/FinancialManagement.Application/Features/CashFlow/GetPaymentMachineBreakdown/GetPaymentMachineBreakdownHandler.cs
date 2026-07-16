using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;

public class GetPaymentMachineBreakdownHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPaymentMachineBreakdownHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PaymentMachineBreakdownItem>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, type: null, cancellationToken);
        var transactionsById = transactions.ToDictionary(t => t.Id);

        var relevant = transactions
            .Where(t => t.Type == TransactionType.Income && t.PaymentMachineId.HasValue)
            .Where(income => IsFeeRealized(income, transactionsById))
            .ToList();

        if (relevant.Count == 0)
            return new List<PaymentMachineBreakdownItem>();

        var machines = await _unitOfWork.PaymentMachines.GetAllAsync(cancellationToken);
        var machinesById = machines.ToDictionary(m => m.Id);

        return relevant
            .GroupBy(t => t.PaymentMachineId!.Value)
            .Where(g => machinesById.ContainsKey(g.Key))
            .Select(g => new PaymentMachineBreakdownItem(
                g.Key,
                machinesById[g.Key].Name,
                g.Sum(t => t.Amount),
                g.Sum(t => t.FeeAmount ?? 0),
                g.Sum(t => t.NetAmount ?? t.Amount),
                g.Count()))
            .OrderByDescending(item => item.FeeAmount)
            .ToList();
    }

    /// <summary>
    /// The fee expense is confirmed/paid immediately when the sale is registered, independent of the
    /// originating income ever being reconciled (marked as received). So a card sale should count here as
    /// soon as its fee was actually charged (fee expense settled), rather than waiting on the income's own
    /// settlement status - otherwise fees already paid out silently disappear from this breakdown.
    /// </summary>
    private static bool IsFeeRealized(Transaction income, IReadOnlyDictionary<Guid, Transaction> transactionsById)
    {
        if (income.FeeAmount is null or 0 || income.LinkedFeeTransactionId is null)
            return income.IsSettled;

        return transactionsById.TryGetValue(income.LinkedFeeTransactionId.Value, out var feeExpense) && feeExpense.IsSettled;
    }
}
