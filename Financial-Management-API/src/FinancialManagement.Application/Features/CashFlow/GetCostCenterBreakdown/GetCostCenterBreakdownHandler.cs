using FinancialManagement.Domain.Enums;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;

public class GetCostCenterBreakdownHandler
{
    private const string Unassigned = "Sem centro de custo";

    private readonly IUnitOfWork _unitOfWork;

    public GetCostCenterBreakdownHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CostCenterBreakdownItem>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, type: null, cancellationToken);
        var settled = transactions.Where(t => t.IsSettled).ToList();

        if (settled.Count == 0)
            return new List<CostCenterBreakdownItem>();

        var costCenters = await _unitOfWork.CostCenters.GetAllAsync(cancellationToken);
        var costCentersById = costCenters.ToDictionary(c => c.Id);

        return settled
            .GroupBy(t => t.CostCenterId)
            .Select(g => new CostCenterBreakdownItem(
                g.Key,
                g.Key.HasValue && costCentersById.TryGetValue(g.Key.Value, out var costCenter) ? costCenter.Name : Unassigned,
                g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                g.Count()))
            .OrderByDescending(item => item.IncomeAmount + item.ExpenseAmount)
            .ToList();
    }
}
