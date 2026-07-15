using FluentValidation;

namespace FinancialManagement.Application.Features.CostCenters.Update;

public class UpdateCostCenterValidator : AbstractValidator<UpdateCostCenterRequest>
{
    public UpdateCostCenterValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}
