<?php

namespace App\Support;

use App\Models\Service;

class ServiceBilling
{
    public static function isHourly(?Service $service): bool
    {
        if (! $service) {
            return false;
        }

        if ($service->billing_mode === 'hourly') {
            return true;
        }

        $unit = strtolower(trim((string) ($service->unit ?? '')));

        return in_array($unit, ['hour', 'hours', 'hr', 'hrs'], true);
    }

    /**
     * @param  iterable<int, \App\Models\InvoiceItem|\App\Models\OfferItem>  $items
     */
    public static function quantityHeaderForItems(iterable $items): string
    {
        $priced = collect($items)->filter(fn ($item) => (float) ($item->price ?? 0) > 0 || (float) ($item->quantity ?? 0) > 0);
        if ($priced->isEmpty()) {
            return 'Quantity';
        }

        $flags = $priced->map(fn ($item) => self::isHourly($item->service));
        if ($flags->every(fn ($v) => $v)) {
            return 'Hours';
        }
        if ($flags->contains(true)) {
            return 'Qty / hours';
        }

        return 'Quantity';
    }

    public static function priceHeaderForItems(iterable $items): string
    {
        $priced = collect($items)->filter(fn ($item) => (float) ($item->price ?? 0) > 0 || (float) ($item->quantity ?? 0) > 0);
        if ($priced->isEmpty()) {
            return 'Price';
        }

        $flags = $priced->map(fn ($item) => self::isHourly($item->service));
        if ($flags->every(fn ($v) => $v)) {
            return 'Rate / hour';
        }
        if ($flags->contains(true)) {
            return 'Price / rate';
        }

        return 'Price';
    }
}
