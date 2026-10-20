<?php

namespace Tests\Feature;

use App\Mail\InvoiceReminder;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Language;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Status;
use App\Models\User;
use App\Services\InvoiceOverdueReminderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InvoiceOverdueReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Language::query()->create(['name' => 'English', 'code' => 'en']);
    }

    public function test_overdue_reminder_sent_on_scheduled_milestone(): void
    {
        Mail::fake();

        SiteSetting::set('comm_scheduled_enabled', '1', 'boolean');
        SiteSetting::set('comm_scheduled_notifications', json_encode([
            'invoice_reminder_use_company_settings' => true,
        ]), 'json');
        SiteSetting::set('fin_reminder_schedule', json_encode([7]), 'json');
        SiteSetting::set('fin_reminder_grace_days', '0', 'integer');

        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'first_name' => 'A',
            'surname' => 'B',
            'language' => Language::first()->id,
            'email' => 'co@example.test',
            'phone' => '+32000000001',
            'vat_number' => 'BE0123',
            'company_name' => 'Co',
            'street' => 'S',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ]);

        $sentStatus = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);

        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Pat',
            'surname' => 'Client',
            'email' => 'client@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);

        $service = Service::create([
            'company_id' => $company->id,
            'name' => 'Work',
            'price' => 100,
            'status' => 1,
        ]);

        $invoice = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-1001',
            'invoice_date' => now()->subDays(14),
            'due_date' => now()->subDays(7),
            'status' => $sentStatus->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
            'reminder_enabled' => true,
            'reminder_auto_stage' => 0,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'service_id' => $service->id,
            'description' => 'Line',
            'quantity' => 1,
            'price' => 100,
            'total' => 100,
        ]);

        $result = app(InvoiceOverdueReminderService::class)->run();

        $this->assertSame(1, $result['sent']);
        Mail::assertSent(InvoiceReminder::class, fn (InvoiceReminder $mail) => $mail->hasTo('client@example.test'));
        $this->assertSame(1, $invoice->fresh()->reminder_auto_stage);
    }

    public function test_overdue_reminder_skipped_when_per_invoice_opt_in_disabled(): void
    {
        Mail::fake();

        SiteSetting::set('comm_scheduled_enabled', '1', 'boolean');
        SiteSetting::set('comm_scheduled_notifications', json_encode([
            'invoice_reminder_use_company_settings' => true,
        ]), 'json');
        SiteSetting::set('fin_reminder_schedule', json_encode([7]), 'json');

        $user = User::factory()->create(['email_verified_at' => now()]);
        $company = Company::create([
            'user_id' => $user->id,
            'first_name' => 'A',
            'surname' => 'B',
            'language' => Language::first()->id,
            'email' => 'co@example.test',
            'phone' => '+32000000001',
            'vat_number' => 'BE0123',
            'company_name' => 'Co',
            'street' => 'S',
            'house' => '1',
            'postal_code' => '1000',
            'city' => 'Brussels',
            'is_active' => true,
        ]);

        $sentStatus = Status::query()->create(['name' => 'Sent', 'for' => 'invoices']);

        $customer = Customer::create([
            'company_id' => $company->id,
            'first_name' => 'Pat',
            'surname' => 'Client',
            'email' => 'client@example.test',
            'type' => 'individual',
            'status' => 1,
        ]);

        $invoice = Invoice::create([
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-1002',
            'invoice_date' => now()->subDays(14),
            'due_date' => now()->subDays(7),
            'status' => $sentStatus->id,
            'payment_status' => Invoice::PAYMENT_UNPAID,
            'reminder_enabled' => false,
        ]);

        $result = app(InvoiceOverdueReminderService::class)->run();

        $this->assertSame(0, $result['sent']);
        Mail::assertNothingSent();
    }
}
