namespace FinancialManagement.Application.Features.Authentication.Login;

public record LoginResponse(
    string AccessToken,
    DateTime ExpiresAt,
    string RefreshToken,
    Guid UserId,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles);
