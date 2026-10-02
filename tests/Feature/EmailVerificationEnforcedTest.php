<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationEnforcedTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_cannot_access_dashboard(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('register.verify'));
    }
}
