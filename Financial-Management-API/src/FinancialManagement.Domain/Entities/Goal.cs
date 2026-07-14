using FinancialManagement.Domain.Enums;
using FinancialManagement.SharedKernel.Entities;

namespace FinancialManagement.Domain.Entities;

public class Goal : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public GoalType Type { get; private set; }
    public decimal TargetAmount { get; private set; }
    public decimal CurrentAmount { get; private set; }
    public DateTime Deadline { get; private set; }
    public bool IsAchieved { get; private set; }

    private Goal() { }

    public Goal(string name, GoalType type, decimal targetAmount, DateTime deadline)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("O nome da meta é obrigatório.", nameof(name));

        if (targetAmount <= 0)
            throw new ArgumentException("O valor alvo deve ser positivo.", nameof(targetAmount));

        Name = name;
        Type = type;
        TargetAmount = targetAmount;
        Deadline = deadline;
    }

    public void UpdateProgress(decimal currentAmount)
    {
        if (currentAmount < 0)
            throw new ArgumentException("O valor atual não pode ser negativo.", nameof(currentAmount));

        CurrentAmount = currentAmount;
        IsAchieved = CurrentAmount >= TargetAmount;
    }

    public decimal ProgressPercent => TargetAmount == 0 ? 0 : Math.Min(100m, Math.Round(CurrentAmount / TargetAmount * 100m, 2));
}
