using FluentValidation;

namespace FinancialManagement.Application.Features.Income.Create;

public class CreateIncomeValidator : AbstractValidator<CreateIncomeRequest>
{
    public CreateIncomeValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.PaymentMethod).IsInEnum();
        RuleFor(x => x.Installments).GreaterThanOrEqualTo(1).When(x => x.Installments.HasValue);
    }
}
