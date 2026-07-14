using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetSummary;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FinancialManagement.Infrastructure.Reports;

public class ReportExportService : IReportExportService
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    public byte[] GenerateCashFlowPdf(CashFlowSummaryResponse summary, DateTime from, DateTime to)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Text($"Fluxo de Caixa - {from:dd/MM/yyyy} a {to:dd/MM/yyyy}").FontSize(16).Bold();

                page.Content().PaddingTop(15).Column(column =>
                {
                    column.Item().Text($"Entradas: {summary.TotalIncome.ToString("C", PtBr)}");
                    column.Item().Text($"Saídas: {summary.TotalExpense.ToString("C", PtBr)}");
                    column.Item().Text($"Resultado do período: {summary.NetFlow.ToString("C", PtBr)}");
                    column.Item().Text($"Saldo consolidado: {summary.CurrentAccumulatedBalance.ToString("C", PtBr)}");

                    column.Item().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Data").Bold();
                            header.Cell().Text("Entradas").Bold();
                            header.Cell().Text("Saídas").Bold();
                            header.Cell().Text("Saldo").Bold();
                        });

                        foreach (var day in summary.DailyBreakdown)
                        {
                            table.Cell().Text(day.Date.ToString("dd/MM/yyyy"));
                            table.Cell().Text(day.Income.ToString("C", PtBr));
                            table.Cell().Text(day.Expense.ToString("C", PtBr));
                            table.Cell().Text(day.Balance.ToString("C", PtBr));
                        }
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Gerado em ");
                    x.Span(DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm"));
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateCashFlowExcel(CashFlowSummaryResponse summary, DateTime from, DateTime to)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Fluxo de Caixa");

        worksheet.Cell(1, 1).Value = $"Fluxo de Caixa - {from:dd/MM/yyyy} a {to:dd/MM/yyyy}";
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(3, 1).Value = "Data";
        worksheet.Cell(3, 2).Value = "Entradas";
        worksheet.Cell(3, 3).Value = "Saídas";
        worksheet.Cell(3, 4).Value = "Saldo";
        worksheet.Range(3, 1, 3, 4).Style.Font.Bold = true;

        var row = 4;
        foreach (var day in summary.DailyBreakdown)
        {
            worksheet.Cell(row, 1).Value = day.Date;
            worksheet.Cell(row, 2).Value = day.Income;
            worksheet.Cell(row, 3).Value = day.Expense;
            worksheet.Cell(row, 4).Value = day.Balance;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateCashFlowCsv(CashFlowSummaryResponse summary, DateTime from, DateTime to)
    {
        var builder = new StringBuilder();
        builder.AppendLine("Data;Entradas;Saidas;Saldo");

        foreach (var day in summary.DailyBreakdown)
        {
            builder.AppendLine($"{day.Date:dd/MM/yyyy};{day.Income};{day.Expense};{day.Balance}");
        }

        return Encoding.UTF8.GetBytes(builder.ToString());
    }
}
