<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['name', 'value'];

    public static function getValue(string $name, mixed $default = null): mixed
    {
        return static::query()
            ->where('name', $name)
            ->value('value') ?? $default;
    }

    public static function getPhoneDigits(): int
    {
        return max((int) static::getValue('phone_digits', 11), 1);
    }

    public static function getCurrencySymbol(): string
    {
        return trim((string) static::getValue('currency_symbol', 'TK')) ?: 'TK';
    }

    public static function getCurrencyCode(): string
    {
        return trim((string) static::getValue('currency_code', 'BDT')) ?: 'BDT';
    }

    public static function getProductUnits(): array
    {
        $rawUnits = (string) static::getValue('product_units', "pcs\nkg\nliter");

        return collect(preg_split('/\r\n|\r|\n/', $rawUnits) ?: [])
            ->map(fn ($unit) => trim($unit))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
