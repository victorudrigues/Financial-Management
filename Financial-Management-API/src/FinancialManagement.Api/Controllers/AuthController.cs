using FinancialManagement.Api.Common;
using FinancialManagement.Application.Features.Authentication.Login;
using FinancialManagement.Application.Features.Authentication.Register;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinancialManagement.Api.Controllers;

[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ApiControllerBase
{
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly LoginHandler _loginHandler;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly RegisterHandler _registerHandler;

    public AuthController(
        IValidator<LoginRequest> loginValidator,
        LoginHandler loginHandler,
        IValidator<RegisterRequest> registerValidator,
        RegisterHandler registerHandler)
    {
        _loginValidator = loginValidator;
        _loginHandler = loginHandler;
        _registerValidator = registerValidator;
        _registerHandler = registerHandler;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_loginValidator, request);
        if (validationError is not null)
            return validationError;

        var result = await _loginHandler.HandleAsync(request, cancellationToken);
        return FromResult(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var validationError = await ValidateAsync(_registerValidator, request);
        if (validationError is not null)
            return validationError;

        var result = await _registerHandler.HandleAsync(request, cancellationToken);
        return FromResult(result);
    }
}
