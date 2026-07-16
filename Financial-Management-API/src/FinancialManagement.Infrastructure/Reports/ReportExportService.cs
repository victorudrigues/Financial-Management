using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using FinancialManagement.Application.Common.Interfaces;
using FinancialManagement.Application.Features.CashFlow.GetAccountBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCategoryBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetCostCenterBreakdown;
using FinancialManagement.Application.Features.CashFlow.GetPaymentMachineBreakdown;
using FinancialManagement.Application.Features.Reports.ExportCashFlow;
using FinancialManagement.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FinancialManagement.Infrastructure.Reports;

public class ReportExportService : IReportExportService
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    private static readonly string IncomeColor = Colors.Green.Darken2;
    private static readonly string IncomeBackground = Colors.Green.Lighten4;
    private static readonly string ExpenseColor = Colors.Red.Darken2;
    private static readonly string ExpenseBackground = Colors.Red.Lighten4;
    private static readonly string NeutralBackground = Colors.Grey.Lighten3;

    public byte[] GenerateCashFlowPdf(CashFlowReportData data)
    {
        var summary = data.Summary;
        var incomeCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Income).ToList();
        var expenseCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Expense).ToList();
        var otherCategories = data.CategoryBreakdown
            .Where(c => c.CategoryType != CategoryType.Income && c.CategoryType != CategoryType.Expense)
            .ToList();
        var totalMachineFees = data.PaymentMachineBreakdown.Sum(m => m.FeeAmount);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text($"Relatório Financeiro - {data.From:dd/MM/yyyy} a {data.To:dd/MM/yyyy}").FontSize(16).Bold();

                page.Content().PaddingTop(15).Column(column =>
                {
                    column.Spacing(14);

                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Element(e => SummaryTile(e, "Entradas", summary.TotalIncome, IncomeColor, IncomeBackground));
                        row.RelativeItem().Element(e => SummaryTile(e, "Saídas", summary.TotalExpense, ExpenseColor, ExpenseBackground));
                        row.RelativeItem().Element(e => SummaryTile(e, "Taxas de Maquineta", totalMachineFees, ExpenseColor, ExpenseBackground));
                        row.RelativeItem().Element(e => SummaryTile(
                            e,
                            "Resultado do Período",
                            summary.NetFlow,
                            summary.NetFlow >= 0 ? IncomeColor : ExpenseColor,
                            summary.NetFlow >= 0 ? IncomeBackground : ExpenseBackground));
                    });

                    column.Item().Text($"Saldo consolidado: {summary.CurrentAccumulatedBalance.ToString("C", PtBr)}").Bold();

                    column.Item().Element(e => SectionTitle(e, "Fluxo de Caixa Diário", NeutralBackground));
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
                            HeaderCell(header.Cell(), "Data");
                            HeaderCell(header.Cell(), "Entradas");
                            HeaderCell(header.Cell(), "Saídas");
                            HeaderCell(header.Cell(), "Saldo");
                        });

                        foreach (var day in summary.DailyBreakdown)
                        {
                            table.Cell().Text(day.Date.ToString("dd/MM/yyyy"));
                            table.Cell().Text(day.Income.ToString("C", PtBr)).FontColor(IncomeColor);
                            table.Cell().Text(day.Expense.ToString("C", PtBr)).FontColor(ExpenseColor);
                            table.Cell().Text(day.Balance.ToString("C", PtBr));
                        }
                    });

                    column.Item().Element(e => SectionTitle(e, "Entradas por Categoria", IncomeBackground));
                    column.Item().Element(e => CategoryTable(e, incomeCategories, IncomeColor));

                    column.Item().Element(e => SectionTitle(e, "Saídas por Categoria", ExpenseBackground));
                    column.Item().Element(e => CategoryTable(e, expenseCategories, ExpenseColor));

                    if (otherCategories.Count > 0)
                    {
                        column.Item().Element(e => SectionTitle(e, "Outras Movimentações por Categoria", NeutralBackground));
                        column.Item().Element(e => CategoryTable(e, otherCategories, Colors.Black));
                    }

                    column.Item().Element(e => SectionTitle(e, "Custo das Maquinetas", ExpenseBackground));
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            HeaderCell(header.Cell(), "Maquineta");
                            HeaderCell(header.Cell(), "Valor Bruto");
                            HeaderCell(header.Cell(), "Taxas");
                            HeaderCell(header.Cell(), "Valor Líquido");
                            HeaderCell(header.Cell(), "Qtd.");
                        });

                        foreach (var item in data.PaymentMachineBreakdown)
                        {
                            table.Cell().Text(item.PaymentMachineName);
                            table.Cell().Text(item.GrossAmount.ToString("C", PtBr));
                            table.Cell().Text(item.FeeAmount.ToString("C", PtBr)).FontColor(ExpenseColor);
                            table.Cell().Text(item.NetAmount.ToString("C", PtBr));
                            table.Cell().Text(item.TransactionCount.ToString());
                        }

                        if (data.PaymentMachineBreakdown.Count == 0)
                            table.Cell().ColumnSpan(5).Text("Nenhuma venda em maquineta no período.").Italic();
                    });

                    column.Item().Element(e => SectionTitle(e, "Por Centro de Custo", NeutralBackground));
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            HeaderCell(header.Cell(), "Centro de Custo");
                            HeaderCell(header.Cell(), "Entradas");
                            HeaderCell(header.Cell(), "Saídas");
                            HeaderCell(header.Cell(), "Saldo");
                            HeaderCell(header.Cell(), "Qtd.");
                        });

                        foreach (var item in data.CostCenterBreakdown)
                        {
                            table.Cell().Text(item.CostCenterName);
                            table.Cell().Text(item.IncomeAmount.ToString("C", PtBr)).FontColor(IncomeColor);
                            table.Cell().Text(item.ExpenseAmount.ToString("C", PtBr)).FontColor(ExpenseColor);
                            table.Cell().Text((item.IncomeAmount - item.ExpenseAmount).ToString("C", PtBr));
                            table.Cell().Text(item.TransactionCount.ToString());
                        }

                        if (data.CostCenterBreakdown.Count == 0)
                            table.Cell().ColumnSpan(5).Text("Nenhuma movimentação com centro de custo no período.").Italic();
                    });

                    column.Item().Element(e => SectionTitle(e, "Por Conta", NeutralBackground));
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(2);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            HeaderCell(header.Cell(), "Conta");
                            HeaderCell(header.Cell(), "Tipo");
                            HeaderCell(header.Cell(), "Entradas");
                            HeaderCell(header.Cell(), "Saídas");
                            HeaderCell(header.Cell(), "Saldo do Período");
                            HeaderCell(header.Cell(), "Saldo Atual");
                        });

                        foreach (var item in data.AccountBreakdown)
                        {
                            var periodIncome = item.IncomeAmount + item.TransferInAmount;
                            var periodExpense = item.ExpenseAmount + item.TransferOutAmount;

                            table.Cell().Text(item.AccountName);
                            table.Cell().Text(AccountTypeLabel(item.AccountType));
                            table.Cell().Text(periodIncome.ToString("C", PtBr)).FontColor(IncomeColor);
                            table.Cell().Text(periodExpense.ToString("C", PtBr)).FontColor(ExpenseColor);
                            table.Cell().Text((periodIncome - periodExpense).ToString("C", PtBr));
                            table.Cell().Text(item.CurrentBalance.ToString("C", PtBr));
                        }

                        if (data.AccountBreakdown.Count == 0)
                            table.Cell().ColumnSpan(6).Text("Nenhuma conta cadastrada.").Italic();
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

    private static void SummaryTile(IContainer container, string label, decimal value, string color, string background)
    {
        container.Background(background).Padding(8).Column(column =>
        {
            column.Item().Text(label).FontSize(9).FontColor(Colors.Grey.Darken2);
            column.Item().Text(value.ToString("C", PtBr)).FontSize(13).Bold().FontColor(color);
        });
    }

    private static void SectionTitle(IContainer container, string title, string background) =>
        container.Background(background).Padding(5).Text(title).Bold();

    private static void HeaderCell(IContainer container, string text) =>
        container.Background(Colors.Grey.Lighten2).Padding(3).Text(text).Bold();

    private static void CategoryTable(IContainer container, IReadOnlyList<CategoryBreakdownItem> items, string amountColor)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(2);
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            table.Header(header =>
            {
                HeaderCell(header.Cell(), "Categoria");
                HeaderCell(header.Cell(), "Valor");
                HeaderCell(header.Cell(), "Qtd.");
            });

            foreach (var item in items)
            {
                table.Cell().Text(item.CategoryName);
                table.Cell().Text(item.TotalAmount.ToString("C", PtBr)).FontColor(amountColor);
                table.Cell().Text(item.TransactionCount.ToString());
            }

            if (items.Count == 0)
                table.Cell().ColumnSpan(3).Text("Nenhuma movimentação categorizada no período.").Italic();
        });
    }

    public byte[] GenerateCashFlowExcel(CashFlowReportData data)
    {
        var summary = data.Summary;
        var incomeCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Income).ToList();
        var expenseCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Expense).ToList();
        var totalMachineFees = data.PaymentMachineBreakdown.Sum(m => m.FeeAmount);

        using var workbook = new XLWorkbook();

        var summarySheet = workbook.Worksheets.Add("Resumo");
        summarySheet.Cell(1, 1).Value = $"Relatório Financeiro - {data.From:dd/MM/yyyy} a {data.To:dd/MM/yyyy}";
        summarySheet.Cell(1, 1).Style.Font.Bold = true;
        summarySheet.Cell(1, 1).Style.Font.FontSize = 14;

        WriteSummaryRow(summarySheet, 3, "Entradas", summary.TotalIncome, IncomeFill, IncomeFont);
        WriteSummaryRow(summarySheet, 4, "Saídas", summary.TotalExpense, ExpenseFill, ExpenseFont);
        WriteSummaryRow(summarySheet, 5, "Taxas de Maquineta", totalMachineFees, ExpenseFill, ExpenseFont);
        WriteSummaryRow(summarySheet, 6, "Resultado do Período", summary.NetFlow, summary.NetFlow >= 0 ? IncomeFill : ExpenseFill, summary.NetFlow >= 0 ? IncomeFont : ExpenseFont);
        WriteSummaryRow(summarySheet, 7, "Saldo Consolidado", summary.CurrentAccumulatedBalance, XLColor.White, XLColor.Black);
        summarySheet.Columns().AdjustToContents();

        var cashFlowSheet = workbook.Worksheets.Add("Fluxo Diário");
        WriteHeaderRow(cashFlowSheet, 1, "Data", "Entradas", "Saídas", "Saldo");
        var row = 2;
        foreach (var day in summary.DailyBreakdown)
        {
            cashFlowSheet.Cell(row, 1).Value = day.Date;
            cashFlowSheet.Cell(row, 2).Value = day.Income;
            cashFlowSheet.Cell(row, 2).Style.Font.FontColor = IncomeFont;
            cashFlowSheet.Cell(row, 3).Value = day.Expense;
            cashFlowSheet.Cell(row, 3).Style.Font.FontColor = ExpenseFont;
            cashFlowSheet.Cell(row, 4).Value = day.Balance;
            row++;
        }
        cashFlowSheet.Columns().AdjustToContents();

        WriteCategorySheet(workbook, "Entradas por Categoria", incomeCategories, IncomeFill, IncomeFont);
        WriteCategorySheet(workbook, "Saídas por Categoria", expenseCategories, ExpenseFill, ExpenseFont);

        var machineSheet = workbook.Worksheets.Add("Maquinetas");
        WriteHeaderRow(machineSheet, 1, "Maquineta", "Valor Bruto", "Taxas", "Valor Líquido", "Qtd. Movimentações");
        row = 2;
        foreach (var item in data.PaymentMachineBreakdown)
        {
            machineSheet.Cell(row, 1).Value = item.PaymentMachineName;
            machineSheet.Cell(row, 2).Value = item.GrossAmount;
            machineSheet.Cell(row, 3).Value = item.FeeAmount;
            machineSheet.Cell(row, 3).Style.Font.FontColor = ExpenseFont;
            machineSheet.Cell(row, 4).Value = item.NetAmount;
            machineSheet.Cell(row, 5).Value = item.TransactionCount;
            row++;
        }
        machineSheet.Columns().AdjustToContents();

        var costCenterSheet = workbook.Worksheets.Add("Por Centro de Custo");
        WriteHeaderRow(costCenterSheet, 1, "Centro de Custo", "Entradas", "Saídas", "Saldo", "Qtd. Movimentações");
        row = 2;
        foreach (var item in data.CostCenterBreakdown)
        {
            costCenterSheet.Cell(row, 1).Value = item.CostCenterName;
            costCenterSheet.Cell(row, 2).Value = item.IncomeAmount;
            costCenterSheet.Cell(row, 2).Style.Font.FontColor = IncomeFont;
            costCenterSheet.Cell(row, 3).Value = item.ExpenseAmount;
            costCenterSheet.Cell(row, 3).Style.Font.FontColor = ExpenseFont;
            costCenterSheet.Cell(row, 4).Value = item.IncomeAmount - item.ExpenseAmount;
            costCenterSheet.Cell(row, 5).Value = item.TransactionCount;
            row++;
        }
        costCenterSheet.Columns().AdjustToContents();

        var accountSheet = workbook.Worksheets.Add("Por Conta");
        WriteHeaderRow(accountSheet, 1, "Conta", "Tipo", "Entradas", "Saídas", "Saldo do Período", "Saldo Atual", "Qtd. Movimentações");
        row = 2;
        foreach (var item in data.AccountBreakdown)
        {
            var periodIncome = item.IncomeAmount + item.TransferInAmount;
            var periodExpense = item.ExpenseAmount + item.TransferOutAmount;

            accountSheet.Cell(row, 1).Value = item.AccountName;
            accountSheet.Cell(row, 2).Value = AccountTypeLabel(item.AccountType);
            accountSheet.Cell(row, 3).Value = periodIncome;
            accountSheet.Cell(row, 3).Style.Font.FontColor = IncomeFont;
            accountSheet.Cell(row, 4).Value = periodExpense;
            accountSheet.Cell(row, 4).Style.Font.FontColor = ExpenseFont;
            accountSheet.Cell(row, 5).Value = periodIncome - periodExpense;
            accountSheet.Cell(row, 6).Value = item.CurrentBalance;
            accountSheet.Cell(row, 7).Value = item.TransactionCount;
            row++;
        }
        accountSheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static readonly XLColor IncomeFill = XLColor.FromHtml("#DCFCE7");
    private static readonly XLColor IncomeFont = XLColor.FromHtml("#15803D");
    private static readonly XLColor ExpenseFill = XLColor.FromHtml("#FEE2E2");
    private static readonly XLColor ExpenseFont = XLColor.FromHtml("#B91C1C");

    private static void WriteSummaryRow(IXLWorksheet sheet, int row, string label, decimal value, XLColor fill, XLColor font)
    {
        sheet.Cell(row, 1).Value = label;
        sheet.Cell(row, 2).Value = value;
        sheet.Range(row, 1, row, 2).Style.Fill.BackgroundColor = fill;
        sheet.Range(row, 1, row, 2).Style.Font.FontColor = font;
        sheet.Range(row, 1, row, 2).Style.Font.Bold = true;
    }

    private static void WriteHeaderRow(IXLWorksheet sheet, int row, params string[] headers)
    {
        for (var i = 0; i < headers.Length; i++)
        {
            sheet.Cell(row, i + 1).Value = headers[i];
        }

        var headerRange = sheet.Range(row, 1, row, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#E5E7EB");
    }

    private static void WriteCategorySheet(XLWorkbook workbook, string sheetName, IReadOnlyList<CategoryBreakdownItem> items, XLColor fill, XLColor font)
    {
        var sheet = workbook.Worksheets.Add(sheetName);
        WriteHeaderRow(sheet, 1, "Categoria", "Valor", "Qtd. Movimentações");

        var row = 2;
        foreach (var item in items)
        {
            sheet.Cell(row, 1).Value = item.CategoryName;
            sheet.Cell(row, 2).Value = item.TotalAmount;
            sheet.Cell(row, 2).Style.Font.FontColor = font;
            sheet.Cell(row, 3).Value = item.TransactionCount;
            row++;
        }

        sheet.Columns().AdjustToContents();
    }

    public byte[] GenerateCashFlowCsv(CashFlowReportData data)
    {
        var summary = data.Summary;
        var incomeCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Income).ToList();
        var expenseCategories = data.CategoryBreakdown.Where(c => c.CategoryType == CategoryType.Expense).ToList();
        var otherCategories = data.CategoryBreakdown
            .Where(c => c.CategoryType != CategoryType.Income && c.CategoryType != CategoryType.Expense)
            .ToList();
        var totalMachineFees = data.PaymentMachineBreakdown.Sum(m => m.FeeAmount);

        var builder = new StringBuilder();

        builder.AppendLine("Resumo");
        builder.AppendLine($"Entradas;{summary.TotalIncome}");
        builder.AppendLine($"Saidas;{summary.TotalExpense}");
        builder.AppendLine($"Taxas de Maquineta;{totalMachineFees}");
        builder.AppendLine($"Resultado do Periodo;{summary.NetFlow}");
        builder.AppendLine($"Saldo Consolidado;{summary.CurrentAccumulatedBalance}");

        builder.AppendLine();
        builder.AppendLine("Fluxo de Caixa Diario");
        builder.AppendLine("Data;Entradas;Saidas;Saldo");
        foreach (var day in summary.DailyBreakdown)
        {
            builder.AppendLine($"{day.Date:dd/MM/yyyy};{day.Income};{day.Expense};{day.Balance}");
        }

        AppendCategorySection(builder, "Entradas por Categoria", incomeCategories);
        AppendCategorySection(builder, "Saidas por Categoria", expenseCategories);

        if (otherCategories.Count > 0)
            AppendCategorySection(builder, "Outras Movimentacoes por Categoria", otherCategories);

        builder.AppendLine();
        builder.AppendLine("Custo das Maquinetas");
        builder.AppendLine("Maquineta;Valor Bruto;Taxas;Valor Liquido;Quantidade");
        foreach (var item in data.PaymentMachineBreakdown)
        {
            builder.AppendLine($"{item.PaymentMachineName};{item.GrossAmount};{item.FeeAmount};{item.NetAmount};{item.TransactionCount}");
        }

        builder.AppendLine();
        builder.AppendLine("Por Centro de Custo");
        builder.AppendLine("Centro de Custo;Entradas;Saidas;Saldo;Quantidade");
        foreach (var item in data.CostCenterBreakdown)
        {
            builder.AppendLine($"{item.CostCenterName};{item.IncomeAmount};{item.ExpenseAmount};{item.IncomeAmount - item.ExpenseAmount};{item.TransactionCount}");
        }

        builder.AppendLine();
        builder.AppendLine("Por Conta");
        builder.AppendLine("Conta;Tipo;Entradas;Saidas;Saldo do Periodo;Saldo Atual;Quantidade");
        foreach (var item in data.AccountBreakdown)
        {
            var periodIncome = item.IncomeAmount + item.TransferInAmount;
            var periodExpense = item.ExpenseAmount + item.TransferOutAmount;
            builder.AppendLine(
                $"{item.AccountName};{AccountTypeLabel(item.AccountType)};{periodIncome};{periodExpense};{periodIncome - periodExpense};{item.CurrentBalance};{item.TransactionCount}");
        }

        return Encoding.UTF8.GetBytes(builder.ToString());
    }

    private static void AppendCategorySection(StringBuilder builder, string title, IReadOnlyList<CategoryBreakdownItem> items)
    {
        builder.AppendLine();
        builder.AppendLine(title);
        builder.AppendLine("Categoria;Valor;Quantidade");
        foreach (var item in items)
        {
            builder.AppendLine($"{item.CategoryName};{item.TotalAmount};{item.TransactionCount}");
        }
    }

    private static string AccountTypeLabel(AccountType type) => type switch
    {
        AccountType.Cash => "Dinheiro",
        AccountType.CashRegister => "Caixa",
        AccountType.CheckingAccount => "Conta Corrente",
        AccountType.DigitalAccount => "Conta Digital",
        AccountType.Wallet => "Carteira",
        AccountType.Pix => "PIX",
        _ => type.ToString()
    };
}
