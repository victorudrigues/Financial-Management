using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Goals.Delete;

public class DeleteGoalHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteGoalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> HandleAsync(Guid id, CancellationToken cancellationToken)
    {
        var goal = await _unitOfWork.Goals.GetByIdAsync(id, cancellationToken);

        if (goal is null)
            return Result.Failure("Meta não encontrada.");

        _unitOfWork.Goals.Remove(goal);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
