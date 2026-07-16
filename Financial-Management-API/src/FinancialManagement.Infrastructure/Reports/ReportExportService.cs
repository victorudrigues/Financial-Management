using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetSummary;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FinancialManagement.Infrastructure.Reports;

public class ReportExportService : IReportExportService
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    public byte[] GenerateCashFlowPdf(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Text($"Relatório Financeiro - {from:dd/MM/yyyy} a {to:dd/MM/yyyy}").FontSize(16).Bold();

                page.Content().PaddingTop(15).Column(column =>
                {
                    column.Item().Text($"Entradas: {summary.TotalIncome.ToString("C", PtBr)}");
                    column.Item().Text($"Saídas: {summary.TotalExpense.ToString("C", PtBr)}");
                    column.Item().Text($"Resultado do período: {summary.NetFlow.ToString("C", PtBr)}");
                    column.Item().Text($"Saldo consolidado: {summary.CurrentAccumulatedBalance.ToString("C", PtBr)}");

                    column.Item().PaddingTop(15).Text("Fluxo de Caixa Diário").Bold();
                    column.Item().Table(table =>
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

                    column.Item().PaddingTop(15).Text("Por Categoria").Bold();
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Categoria").Bold();
                            header.Cell().Text("Valor").Bold();
                            header.Cell().Text("Qtd.").Bold();
                        });

                        foreach (var item in categoryBreakdown)
                        {
                            table.Cell().Text(item.CategoryName);
                            table.Cell().Text(item.TotalAmount.ToString("C", PtBr));
                            table.Cell().Text(item.TransactionCount.ToString());
                        }
                    });

                    column.Item().PaddingTop(15).Text("Por Centro de Custo").Bold();
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Centro de Custo").Bold();
                            header.Cell().Text("Entradas").Bold();
                            header.Cell().Text("Saídas").Bold();
                            header.Cell().Text("Qtd.").Bold();
                        });

                        foreach (var item in costCenterBreakdown)
                        {
                            table.Cell().Text(item.CostCenterName);
                            table.Cell().Text(item.IncomeAmount.ToString("C", PtBr));
                            table.Cell().Text(item.ExpenseAmount.ToString("C", PtBr));
                            table.Cell().Text(item.TransactionCount.ToString());
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

    public byte[] GenerateCashFlowExcel(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to)
    {
        using var workbook = new XLWorkbook();

        var cashFlowSheet = workbook.Worksheets.Add("Fluxo de Caixa");
        cashFlowSheet.Cell(1, 1).Value = $"Fluxo de Caixa - {from:dd/MM/yyyy} a {to:dd/MM/yyyy}";
        cashFlowSheet.Cell(1, 1).Style.Font.Bold = true;

        cashFlowSheet.Cell(3, 1).Value = "Data";
        cashFlowSheet.Cell(3, 2).Value = "Entradas";
        cashFlowSheet.Cell(3, 3).Value = "Saídas";
        cashFlowSheet.Cell(3, 4).Value = "Saldo";
        cashFlowSheet.Range(3, 1, 3, 4).Style.Font.Bold = true;

        var row = 4;
        foreach (var day in summary.DailyBreakdown)
        {
            cashFlowSheet.Cell(row, 1).Value = day.Date;
            cashFlowSheet.Cell(row, 2).Value = day.Income;
            cashFlowSheet.Cell(row, 3).Value = day.Expense;
            cashFlowSheet.Cell(row, 4).Value = day.Balance;
            row++;
        }

        cashFlowSheet.Columns().AdjustToContents();

        var categorySheet = workbook.Worksheets.Add("Por Categoria");
        categorySheet.Cell(1, 1).Value = "Categoria";
        categorySheet.Cell(1, 2).Value = "Valor";
        categorySheet.Cell(1, 3).Value = "Qtd. Movimentações";
        categorySheet.Range(1, 1, 1, 3).Style.Font.Bold = true;

        row = 2;
        foreach (var item in categoryBreakdown)
        {
            categorySheet.Cell(row, 1).Value = item.CategoryName;
            categorySheet.Cell(row, 2).Value = item.TotalAmount;
            categorySheet.Cell(row, 3).Value = item.TransactionCount;
            row++;
        }

        categorySheet.Columns().AdjustToContents();

        var costCenterSheet = workbook.Worksheets.Add("Por Centro de Custo");
        costCenterSheet.Cell(1, 1).Value = "Centro de Custo";
        costCenterSheet.Cell(1, 2).Value = "Entradas";
        costCenterSheet.Cell(1, 3).Value = "Saídas";
        costCenterSheet.Cell(1, 4).Value = "Qtd. Movimentações";
        costCenterSheet.Range(1, 1, 1, 4).Style.Font.Bold = true;

        row = 2;
        foreach (var item in costCenterBreakdown)
        {
            costCenterSheet.Cell(row, 1).Value = item.CostCenterName;
            costCenterSheet.Cell(row, 2).Value = item.IncomeAmount;
            costCenterSheet.Cell(row, 3).Value = item.ExpenseAmount;
            costCenterSheet.Cell(row, 4).Value = item.TransactionCount;
            row++;
        }

        costCenterSheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public byte[] GenerateCashFlowCsv(
        CashFlowSummaryResponse summary,
        IReadOnlyList<CategoryBreakdownItem> categoryBreakdown,
        IReadOnlyList<CostCenterBreakdownItem> costCenterBreakdown,
        DateTime from,
        DateTime to)
    {
        var builder = new StringBuilder();

        builder.AppendLine("Fluxo de Caixa Diario");
        builder.AppendLine("Data;Entradas;Saidas;Saldo");
        foreach (var day in summary.DailyBreakdown)
        {
            builder.AppendLine($"{day.Date:dd/MM/yyyy};{day.Income};{day.Expense};{day.Balance}");
        }

        builder.AppendLine();
        builder.AppendLine("Por Categoria");
        builder.AppendLine("Categoria;Valor;Quantidade");
        foreach (var item in categoryBreakdown)
        {
            builder.AppendLine($"{item.CategoryName};{item.TotalAmount};{item.TransactionCount}");
        }

        builder.AppendLine();
        builder.AppendLine("Por Centro de Custo");
        builder.AppendLine("Centro de Custo;Entradas;Saidas;Quantidade");
        foreach (var item in costCenterBreakdown)
        {
            builder.AppendLine($"{item.CostCenterName};{item.IncomeAmount};{item.ExpenseAmount};{item.TransactionCount}");
        }

        return Encoding.UTF8.GetBytes(builder.ToString());
    }
}
