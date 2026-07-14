namespace FinancialManagement.Application.Common.Interfaces;

public record AuthTokenResult(string AccessToken, DateTime ExpiresAt, string RefreshToken);

public interface ITokenService
{
    AuthTokenResult GenerateToken(Guid userId, string email, IReadOnlyList<string> roles);
    string GenerateRefreshToken();
}
