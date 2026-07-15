using FluentValidation;

namespace FinancialManagement.Application.Features.Goals.Update;

public class UpdateGoalValidator : AbstractValidator<UpdateGoalRequest>
{
    public UpdateGoalValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.TargetAmount).GreaterThan(0);
    }
}
