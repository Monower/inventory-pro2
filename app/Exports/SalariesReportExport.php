<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SalariesReportExport implements FromCollection, WithHeadings, ShouldAutoSize
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
            'Employee',
            'Month',
            'Basic Salary',
            'Bonus',
            'Deductions',
            'Net Salary',
            'Paid Status',
            'Paid At',
        ];
    }
}
