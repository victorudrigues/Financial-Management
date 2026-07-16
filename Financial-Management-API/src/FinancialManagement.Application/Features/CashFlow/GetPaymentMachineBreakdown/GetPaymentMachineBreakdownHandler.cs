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
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, TransactionType.Income, cancellationToken);
        var settled = transactions.Where(t => t.IsSettled && t.PaymentMachineId.HasValue).ToList();

        if (settled.Count == 0)
            return new List<PaymentMachineBreakdownItem>();

        var machines = await _unitOfWork.PaymentMachines.GetAllAsync(cancellationToken);
        var machinesById = machines.ToDictionary(m => m.Id);

        return settled
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
}
