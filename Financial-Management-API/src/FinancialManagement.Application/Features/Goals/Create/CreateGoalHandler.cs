using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Goals.Create;

public class CreateGoalHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateGoalHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<GoalResponse>> HandleAsync(CreateGoalRequest request, CancellationToken cancellationToken)
    {
        var goal = new Goal(request.Name, request.Type, request.TargetAmount, request.Deadline);

        await _unitOfWork.Goals.AddAsync(goal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(ToResponse(goal));
    }

    private static GoalResponse ToResponse(Goal goal) => new(
        goal.Id, goal.Name, goal.Type, goal.TargetAmount, goal.CurrentAmount, goal.Deadline, goal.IsAchieved, goal.ProgressPercent);
}
