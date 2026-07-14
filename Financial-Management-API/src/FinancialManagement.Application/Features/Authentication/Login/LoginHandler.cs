using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Features.Authentication.Login;

public class LoginHandler
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;

    public LoginHandler(IIdentityService identityService, ITokenService tokenService)
    {
        _identityService = identityService;
        _tokenService = tokenService;
    }

    public async Task<Result<LoginResponse>> HandleAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var authResult = await _identityService.ValidateCredentialsAsync(request.Email, request.Password);

        if (!authResult.IsSuccess || authResult.Value is null)
            return Result.Failure<LoginResponse>("Credenciais inválidas.");

        var user = authResult.Value;
        var token = _tokenService.GenerateToken(user.UserId, user.Email, user.Roles);

        await _identityService.SaveRefreshTokenAsync(user.UserId, token.RefreshToken, token.ExpiresAt.AddDays(7));

        var response = new LoginResponse(
            token.AccessToken,
            token.ExpiresAt,
            token.RefreshToken,
            user.UserId,
            user.Email,
            user.FullName,
            user.Roles);

        return Result.Success(response);
    }
}
