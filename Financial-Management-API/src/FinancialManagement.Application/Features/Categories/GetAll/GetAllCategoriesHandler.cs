using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.Categories.GetAll;

public class GetAllCategoriesHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllCategoriesHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CategoryResponse>> HandleAsync(CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);

        return categories
            .Select(c => new CategoryResponse(c.Id, c.Name, c.Type, c.Color, c.ParentCategoryId))
            .ToList();
    }
}
