using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Goals;

public record GoalResponse(Guid Id, string Name, GoalType Type, decimal TargetAmount, decimal CurrentAmount, DateTime Deadline, bool IsAchieved, decimal ProgressPercent);
