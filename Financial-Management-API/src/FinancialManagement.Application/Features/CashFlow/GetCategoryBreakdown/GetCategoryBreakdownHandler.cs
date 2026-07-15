using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;

public class GetCategoryBreakdownHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCategoryBreakdownHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CategoryBreakdownItem>> HandleAsync(DateTime from, DateTime to, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetByPeriodAsync(from, to, type: null, cancellationToken);
        var settled = transactions.Where(t => t.IsSettled && t.CategoryId.HasValue).ToList();

        if (settled.Count == 0)
            return new List<CategoryBreakdownItem>();

        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var categoriesById = categories.ToDictionary(c => c.Id);

        return settled
            .GroupBy(t => t.CategoryId!.Value)
            .Where(g => categoriesById.ContainsKey(g.Key))
            .Select(g =>
            {
                var category = categoriesById[g.Key];
                return new CategoryBreakdownItem(
                    category.Id,
                    category.Name,
                    category.Type,
                    category.Color,
                    g.Sum(t => t.Amount),
                    g.Count());
            })
            .OrderByDescending(item => item.TotalAmount)
            .ToList();
    }
}
