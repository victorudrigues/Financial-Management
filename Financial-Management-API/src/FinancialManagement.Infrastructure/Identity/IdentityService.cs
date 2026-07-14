using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.SharedKernel.Common;
using Microsoft.AspNetCore.Identity;

namespace FinancialManagement.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public IdentityService(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<IdentityAuthResult>> RegisterAsync(string fullName, string email, string password, string role)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
            return Result.Failure<IdentityAuthResult>("Já existe um usuário com este e-mail.");

        if (!await _roleManager.RoleExistsAsync(role))
            await _roleManager.CreateAsync(new ApplicationRole(role));

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName
        };

        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
            return Result.Failure<IdentityAuthResult>(createResult.Errors.Select(e => e.Description).ToList());

        await _userManager.AddToRoleAsync(user, role);

        return Result.Success(new IdentityAuthResult(user.Id, user.Email!, user.FullName, new[] { role }));
    }

    public async Task<Result<IdentityAuthResult>> ValidateCredentialsAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || !user.IsActive)
            return Result.Failure<IdentityAuthResult>("Credenciais inválidas.");

        var isValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isValid)
            return Result.Failure<IdentityAuthResult>("Credenciais inválidas.");

        var roles = await _userManager.GetRolesAsync(user);

        return Result.Success(new IdentityAuthResult(user.Id, user.Email!, user.FullName, roles.ToList()));
    }

    public async Task<Result<IdentityAuthResult>> GetByRefreshTokenAsync(string refreshToken)
    {
        var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == refreshToken);
        if (user is null || user.RefreshTokenExpiresAt is null || user.RefreshTokenExpiresAt < DateTime.UtcNow)
            return Result.Failure<IdentityAuthResult>("Refresh token inválido ou expirado.");

        var roles = await _userManager.GetRolesAsync(user);
        return Result.Success(new IdentityAuthResult(user.Id, user.Email!, user.FullName, roles.ToList()));
    }

    public async Task SaveRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiresAt)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return;

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = expiresAt;
        await _userManager.UpdateAsync(user);
    }
}
