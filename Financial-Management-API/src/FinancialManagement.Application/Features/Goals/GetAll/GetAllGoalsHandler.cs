using FinancialManagement.Domain.Entities;
using FinancialManagement.Domain.Repositories;

namespace FinancialManagement.Application.Features.Goals.GetAll;

public class GetAllGoalsHandler
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllGoalsHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<GoalResponse>> HandleAsync(CancellationToken cancellationToken)
    {
        var goals = await _unitOfWork.Goals.GetAllAsync(cancellationToken);
        return goals.Select(ToResponse).ToList();
    }

    private static GoalResponse ToResponse(Goal goal) => new(
        goal.Id, goal.Name, goal.Type, goal.TargetAmount, goal.CurrentAmount, goal.Deadline, goal.IsAchieved, goal.ProgressPercent);
}
