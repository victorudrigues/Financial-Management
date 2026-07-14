namespace FinancialManagement.Application.Features.Reports.ExportCashFlow;

public enum ExportFormat
{
    Pdf = 1,
    Excel = 2,
    Csv = 3
}

public record ExportCashFlowRequest(DateTime From, DateTime To, ExportFormat Format);

public record ExportCashFlowResult(byte[] Content, string ContentType, string FileName);
