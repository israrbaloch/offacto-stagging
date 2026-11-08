<?php

namespace Tests\Unit;

use App\Support\Money;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_half_cent_vat_rounds_so_the_total_adds_up(): void
    {
        $subtotal = Money::line(1.5, 65);

        $this->assertSame(97.5, $subtotal);

        $vat = Money::vat($subtotal, 21);
        $total = Money::total($subtotal, $vat);

        $this->assertSame(20.48, $vat);
        $this->assertSame(117.98, $total);
        $this->assertSame($total, Money::round($subtotal + $vat));
    }
}
