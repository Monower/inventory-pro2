<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OrdersReportExport implements FromCollection, WithHeadings, ShouldAutoSize
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
            'Order Number',
            'Customer',
            'Total Amount',
            'Paid Amount',
            'Due Amount',
            'Payment Status',
            'Created At',
        ];
    }
}
