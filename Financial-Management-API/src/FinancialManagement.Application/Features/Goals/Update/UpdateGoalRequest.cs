using FinancialManagement.Domain.Enums;

namespace FinancialManagement.Application.Features.Goals.Update;

public record UpdateGoalRequest(string Name, GoalType Type, decimal TargetAmount, DateTime Deadline);
