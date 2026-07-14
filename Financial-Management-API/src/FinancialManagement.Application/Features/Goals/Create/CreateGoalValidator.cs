using FluentValidation;

namespace FinancialManagement.Application.Features.Goals.Create;

public class CreateGoalValidator : AbstractValidator<CreateGoalRequest>
{
    public CreateGoalValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.TargetAmount).GreaterThan(0);
        RuleFor(x => x.Deadline).GreaterThan(DateTime.UtcNow.Date);
    }
}
