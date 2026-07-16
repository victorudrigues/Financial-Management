using FluentValidation;

namespace FinancialManagement.Application.Features.PaymentMachines.Create;

public class CreatePaymentMachineValidator : AbstractValidator<CreatePaymentMachineRequest>
{
    public CreatePaymentMachineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PixFeePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.SettlementDays).GreaterThanOrEqualTo(0);

        RuleFor(x => x.BrandFees).NotEmpty().WithMessage("Selecione ao menos uma bandeira aceita.");

        RuleForEach(x => x.BrandFees).ChildRules(brandFee =>
        {
            brandFee.RuleFor(b => b.Brand).IsInEnum();
            brandFee.RuleFor(b => b.DebitFeePercent).InclusiveBetween(0, 100);
            brandFee.RuleFor(b => b.CreditFeePercent).InclusiveBetween(0, 100);
            brandFee.RuleFor(b => b.InstallmentFeePercent).InclusiveBetween(0, 100);
        });
    }
}
