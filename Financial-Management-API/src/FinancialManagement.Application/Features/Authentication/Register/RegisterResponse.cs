namespace FinancialManagement.Application.Features.Authentication.Register;

public record RegisterResponse(
    Guid UserId,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles,
    string AccessToken,
    DateTime ExpiresAt,
    string RefreshToken);
