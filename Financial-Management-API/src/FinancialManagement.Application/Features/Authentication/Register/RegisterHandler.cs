using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Authentication.Register;

public class RegisterHandler
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;

    public RegisterHandler(IIdentityService identityService, ITokenService tokenService)
    {
        _identityService = identityService;
        _tokenService = tokenService;
    }

    public async Task<Result<RegisterResponse>> HandleAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _identityService.RegisterAsync(request.FullName, request.Email, request.Password, request.Role);

        if (!result.IsSuccess || result.Value is null)
            return Result.Failure<RegisterResponse>(result.Errors);

        var user = result.Value;
        var token = _tokenService.GenerateToken(user.UserId, user.Email, user.Roles);

        await _identityService.SaveRefreshTokenAsync(user.UserId, token.RefreshToken, token.ExpiresAt.AddDays(7));

        return Result.Success(new RegisterResponse(
            user.UserId,
            user.Email,
            user.FullName,
            user.Roles,
            token.AccessToken,
            token.ExpiresAt,
            token.RefreshToken));
    }
}
