using FinancialManagement.SharedKernel.Common;

namespace FinancialManagement.Application.Common.Interfaces;

public record IdentityAuthResult(Guid UserId, string Email, string FullName, IReadOnlyList<string> Roles);

public interface IIdentityService
{
    Task<Result<IdentityAuthResult>> RegisterAsync(string fullName, string email, string password, string role);
    Task<Result<IdentityAuthResult>> ValidateCredentialsAsync(string email, string password);
    Task<Result<IdentityAuthResult>> GetByRefreshTokenAsync(string refreshToken);
    Task SaveRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiresAt);
}
