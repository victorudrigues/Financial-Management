namespace FinancialManagement.Application.Features.Transfers.Create;

public record CreateTransferRequest(decimal Amount, Guid SourceAccountId, Guid DestinationAccountId, DateTime CompetenceDate, string? Notes);
