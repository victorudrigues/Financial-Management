using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Goals.Create;

public record CreateGoalRequest(string Name, GoalType Type, decimal TargetAmount, DateTime Deadline);
