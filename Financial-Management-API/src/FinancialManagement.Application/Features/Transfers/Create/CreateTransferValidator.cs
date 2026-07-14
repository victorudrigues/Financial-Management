using FluentValidation;

namespace FinancialManagement.Application.Features.Transfers.Create;

public class CreateTransferValidator : AbstractValidator<CreateTransferRequest>
{
    public CreateTransferValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.SourceAccountId).NotEmpty();
        RuleFor(x => x.DestinationAccountId).NotEmpty().NotEqual(x => x.SourceAccountId)
            .WithMessage("A conta de destino deve ser diferente da conta de origem.");
    }
}
