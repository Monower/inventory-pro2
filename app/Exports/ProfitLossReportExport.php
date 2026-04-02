<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProfitLossReportExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    public function __construct(protected Collection $rows)
    {
    }

    public function collection(): Collection
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return [
            'Month',
            'Sales',
            'Cost Of Goods Sold',
            'Salary Expense',
            'Other Expense',
            'Net Profit',
        ];
    }
}
