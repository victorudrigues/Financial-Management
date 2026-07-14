using FluentValidation;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Authentication.Register;

public class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Role).NotEmpty().Must(role => Roles.All.Contains(role))
            .WithMessage($"O perfil deve ser um dos seguintes: {string.Join(", ", Roles.All)}");
    }
}
