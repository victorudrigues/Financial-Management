using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Authentication.Register;

public class RegisterHandler
{
    private readonly IIdentityService _identityService;

    public RegisterHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Result<RegisterResponse>> HandleAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RegisterAsync(request.FullName, request.Email, request.Password, request.Role);

        if (!result.IsSuccess || result.Value is null)
            return Result.Failure<RegisterResponse>(result.Errors);

        var user = result.Value;
        return Result.Success(new RegisterResponse(user.UserId, user.Email, user.FullName, user.Roles));
    }
}
