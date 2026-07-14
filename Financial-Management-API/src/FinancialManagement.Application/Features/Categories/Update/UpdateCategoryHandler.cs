using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Categories.Update;

public class UpdateCategoryHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategoryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CategoryResponse>> HandleAsync(Guid id, UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);

        if (category is null)
            return Result.Failure<CategoryResponse>("Categoria não encontrada.");

        category.Update(request.Name, request.Color);
        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new CategoryResponse(category.Id, category.Name, category.Type, category.Color, category.ParentCategoryId));
    }
}
