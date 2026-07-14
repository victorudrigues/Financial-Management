using FluentValidation;

namespace FinancialManagement.Application.Features.Accounts.Update;

public class UpdateAccountValidator : AbstractValidator<UpdateAccountRequest>
{
    public UpdateAccountValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}
