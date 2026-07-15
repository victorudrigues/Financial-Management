using FluentValidation;

namespace FinancialManagement.Application.Features.PaymentMachines.Update;

public class UpdatePaymentMachineValidator : AbstractValidator<UpdatePaymentMachineRequest>
{
    public UpdatePaymentMachineValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.DebitFeePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.CreditFeePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.InstallmentFeePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.PixFeePercent).InclusiveBetween(0, 100);
        RuleFor(x => x.SettlementDays).GreaterThanOrEqualTo(0);
    }
}
