<?php

namespace Tests\Unit;

use App\Support\BelgianPaymentReference;
use PHPUnit\Framework\TestCase;

class BelgianPaymentReferenceTest extends TestCase
{
    public function test_zero_base_uses_check_digit_97(): void
    {
        $this->assertSame('+++000/0000/00097+++', BelgianPaymentReference::fromDocument('0'));
    }

    public function test_invoice_number_keeps_only_digits_and_a_valid_mod_97_check(): void
    {
        $reference = BelgianPaymentReference::fromDocument('INV2026-0001');

        $this->assertMatchesRegularExpression('/^\+\+\+\d{3}\/\d{4}\/\d{5}\+\+\+$/', $reference);
        $digits = str_replace(['+', '/'], '', $reference);
        $base = substr($digits, 0, 10);
        $check = (int) substr($digits, 10, 2);
        $expected = (int) $base % 97;
        $this->assertSame($expected === 0 ? 97 : $expected, $check);
        $this->assertSame('0020260001', $base);
    }

    public function test_iban_is_grouped_in_fours(): void
    {
        $this->assertSame('BE68 5390 0754 7034', BelgianPaymentReference::formatIban('be68 539007547034'));
    }
}
