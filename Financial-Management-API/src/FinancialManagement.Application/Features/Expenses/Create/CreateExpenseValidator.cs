using FluentValidation;

namespace FinancialManagement.Application.Features.Expenses.Create;

public class CreateExpenseValidator : AbstractValidator<CreateExpenseRequest>
{
    public CreateExpenseValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(250);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.PaymentMethod).IsInEnum();
        RuleFor(x => x.ExpenseNature).IsInEnum();
        RuleFor(x => x.Recurrence).IsInEnum();
    }
}
