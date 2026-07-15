using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Goals.Update;

public class UpdateGoalHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateGoalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<GoalResponse>> HandleAsync(Guid id, UpdateGoalRequest request, CancellationToken cancellationToken)
    {
        var goal = await _unitOfWork.Goals.GetByIdAsync(id, cancellationToken);

        if (goal is null)
            return Result.Failure<GoalResponse>("Meta não encontrada.");

        goal.Update(request.Name, request.Type, request.TargetAmount, request.Deadline);
        _unitOfWork.Goals.Update(goal);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(new GoalResponse(
            goal.Id, goal.Name, goal.Type, goal.TargetAmount, goal.CurrentAmount, goal.Deadline, goal.IsAchieved, goal.ProgressPercent));
    }
}
