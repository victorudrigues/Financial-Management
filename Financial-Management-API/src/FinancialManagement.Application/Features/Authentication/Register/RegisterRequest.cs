namespace FinancialManagement.Application.Features.Authentication.Register;

public record RegisterRequest(string FullName, string Email, string Password, string Role);
