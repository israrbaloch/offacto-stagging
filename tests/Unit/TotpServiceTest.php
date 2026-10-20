<?php

namespace Tests\Unit;

use App\Services\TotpService;
use PHPUnit\Framework\TestCase;

class TotpServiceTest extends TestCase
{
    public function test_generated_secret_verifies_current_code(): void
    {
        $totp = new TotpService();
        $secret = $totp->generateSecret();
        $code = $totp->currentCode($secret);

        $this->assertTrue($totp->verify($secret, $code));
        $this->assertFalse($totp->verify($secret, '000000'));
    }
}
