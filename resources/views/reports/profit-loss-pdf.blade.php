<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Profit Loss Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            font-size: 12px;
            margin: 24px;
        }

        h1, h2, h3, p {
            margin: 0;
        }

        .header {
            margin-bottom: 20px;
        }

        .muted {
            color: #475569;
        }

        .summary-grid {
            width: 100%;
            margin-bottom: 24px;
        }

        .summary-grid td {
            width: 50%;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
        }

        .summary-label {
            font-size: 11px;
            color: #64748b;
            margin-bottom: 6px;
        }

        .summary-value {
            font-size: 18px;
            font-weight: bold;
        }

        table.report {
            width: 100%;
            border-collapse: collapse;
        }

        table.report th,
        table.report td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
        }

        table.report th {
            background: #e2e8f0;
            font-size: 11px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Profit &amp; Loss Report</h1>
        <p class="muted">
            Period:
            {{ $filters['from_date'] ?: $range['from_date'] ?? 'N/A' }}
            to
            {{ $filters['to_date'] ?: $range['to_date'] ?? 'N/A' }}
        </p>
    </div>

    <table class="summary-grid">
        <tr>
            <td>
                <div class="summary-label">Sales revenue</div>
                <div class="summary-value">{{ number_format($summary['sales_revenue'], 2) }}</div>
            </td>
            <td>
                <div class="summary-label">Sales collected</div>
                <div class="summary-value">{{ number_format($summary['sales_collected'], 2) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="summary-label">Cost of goods sold</div>
                <div class="summary-value">{{ number_format($summary['cost_of_goods_sold'], 2) }}</div>
            </td>
            <td>
                <div class="summary-label">Added money</div>
                <div class="summary-value">{{ number_format($summary['added_money'], 2) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="summary-label">Salary expense</div>
                <div class="summary-value">{{ number_format($summary['salary_expense'], 2) }}</div>
            </td>
            <td>
                <div class="summary-label">Other expense</div>
                <div class="summary-value">{{ number_format($summary['other_expense'], 2) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="summary-label">Gross profit</div>
                <div class="summary-value">{{ number_format($summary['gross_profit'], 2) }}</div>
            </td>
            <td>
                <div class="summary-label">Net profit</div>
                <div class="summary-value">{{ number_format($summary['net_profit'], 2) }}</div>
            </td>
        </tr>
    </table>

    <h3 style="margin-bottom: 10px;">Monthly Breakdown</h3>

    <table class="report">
        <thead>
            <tr>
                <th>Month</th>
                <th>Sales</th>
                <th>Added Money</th>
                <th>COGS</th>
                <th>Salary</th>
                <th>Other Expense</th>
                <th>Net Profit</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($monthlyBreakdown as $row)
                <tr>
                    <td>{{ $row['month'] }}</td>
                    <td>{{ number_format($row['sales'], 2) }}</td>
                    <td>{{ number_format($row['added_money'], 2) }}</td>
                    <td>{{ number_format($row['cogs'], 2) }}</td>
                    <td>{{ number_format($row['salary'], 2) }}</td>
                    <td>{{ number_format($row['other_expense'], 2) }}</td>
                    <td>{{ number_format($row['net_profit'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
