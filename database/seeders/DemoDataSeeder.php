<?php

namespace Database\Seeders;

use App\Models\Briefing;
use App\Models\BriefingAnswer;
use App\Models\BriefingQuestion;
use App\Models\BriefingResponse;
use App\Models\Company;
use App\Models\Country;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use App\Models\Offer;
use App\Models\OfferAttachment;
use App\Models\OfferItem;
use App\Models\Service;
use App\Models\Status;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->wipeOperationalData();

        $companies = Company::query()->get();
        if ($companies->isEmpty()) {
            $this->command?->warn('No companies found. Create a company first, then re-run DemoDataSeeder.');

            return;
        }

        foreach ($companies as $company) {
            $this->seedCompany($company);
        }

        $this->command?->info('Demo data seeded for '.$companies->count().' company/companies.');
    }

    private function wipeOperationalData(): void
    {
        Schema::disableForeignKeyConstraints();

        BriefingAnswer::query()->delete();
        BriefingResponse::query()->delete();
        BriefingQuestion::query()->delete();
        Briefing::query()->delete();

        InvoicePayment::query()->delete();
        InvoiceItem::query()->delete();
        Invoice::withTrashed()->forceDelete();

        OfferAttachment::query()->delete();
        OfferItem::query()->delete();
        Offer::withTrashed()->forceDelete();

        Customer::withTrashed()->forceDelete();
        Service::withTrashed()->forceDelete();

        Schema::enableForeignKeyConstraints();
    }

    private function seedCompany(Company $company): void
    {
        $countryId = Country::query()->where('code', 'BE')->value('id')
            ?? Country::query()->value('id');

        $serviceActive = Status::query()->where('for', 'services')->where('name', 'Active')->value('id');
        $customerActive = Status::query()->where('for', 'customers')->where('name', 'Active')->value('id');
        $customerProspect = Status::query()->where('for', 'customers')->where('name', 'Prospect')->value('id');

        $offerStatuses = Status::query()->where('for', 'offers')->pluck('id', 'name');
        $invoiceStatuses = Status::query()->where('for', 'invoices')->pluck('id', 'name');

        $services = collect([
            ['name' => 'Brand strategy workshop', 'description' => 'Half-day workshop to define positioning and voice.', 'price' => 850, 'unit' => 'workshop'],
            ['name' => 'Website design', 'description' => 'Responsive marketing site design in Figma.', 'price' => 3200, 'unit' => 'project'],
            ['name' => 'Development (hourly)', 'description' => 'Frontend and backend implementation.', 'price' => 95, 'unit' => 'hour'],
            ['name' => 'Copywriting', 'description' => 'Landing page and email copy.', 'price' => 65, 'unit' => 'hour'],
            ['name' => 'Monthly retainer', 'description' => 'Ongoing design and support.', 'price' => 1400, 'unit' => 'month'],
            ['name' => 'Photography', 'description' => 'On-location product shoot.', 'price' => 750, 'unit' => 'day'],
        ])->map(function (array $row) use ($company, $serviceActive) {
            return Service::create([
                'company_id' => $company->id,
                'name' => $row['name'],
                'description' => $row['description'],
                'price' => $row['price'],
                'unit' => $row['unit'],
                'status' => $serviceActive,
            ]);
        });

        $customerRows = [
            ['type' => 'organization', 'org_name' => 'Acme Studios', 'first_name' => 'Sarah', 'surname' => 'Jenkins', 'email' => 'sarah@acmestudios.be', 'phone' => '+32 2 555 0101', 'city' => 'Brussels', 'status' => $customerActive],
            ['type' => 'organization', 'org_name' => 'Northwind Logistics', 'first_name' => 'Marcus', 'surname' => 'Hale', 'email' => 'marcus@northwind.eu', 'phone' => '+32 3 555 0144', 'city' => 'Antwerp', 'status' => $customerActive],
            ['type' => 'organization', 'org_name' => 'Vertex Labs', 'first_name' => 'Lena', 'surname' => 'Ortiz', 'email' => 'lena@vertexlabs.io', 'phone' => '+32 9 555 0188', 'city' => 'Ghent', 'status' => $customerActive],
            ['type' => 'organization', 'org_name' => 'Harbor & Co', 'first_name' => 'Pieter', 'surname' => 'De Smet', 'email' => 'pieter@harborco.be', 'phone' => '+32 50 555 0220', 'city' => 'Bruges', 'status' => $customerProspect],
            ['type' => 'individual', 'org_name' => null, 'first_name' => 'Emma', 'surname' => 'Claes', 'email' => 'emma.claes@example.com', 'phone' => '+32 470 11 22 33', 'city' => 'Leuven', 'status' => $customerActive],
            ['type' => 'individual', 'org_name' => null, 'first_name' => 'Thomas', 'surname' => 'Nguyen', 'email' => 'thomas.nguyen@example.com', 'phone' => '+32 486 44 55 66', 'city' => 'Liege', 'status' => $customerActive],
            ['type' => 'organization', 'org_name' => 'Brightline Retail', 'first_name' => 'Amelie', 'surname' => 'Dupont', 'email' => 'amelie@brightline.fr', 'phone' => '+33 1 5555 0190', 'city' => 'Lille', 'status' => $customerActive],
        ];

        $customers = collect($customerRows)->map(function (array $row) use ($company, $countryId) {
            return Customer::create([
                'company_id' => $company->id,
                'first_name' => $row['first_name'],
                'surname' => $row['surname'],
                'type' => $row['type'],
                'country_id' => $countryId,
                'vat_number' => $row['type'] === 'organization' ? 'BE0'.random_int(100000000, 999999999) : null,
                'org_name' => $row['org_name'],
                'office_address' => $row['city'].', Belgium',
                'email' => $row['email'],
                'phone' => $row['phone'],
                'notes' => null,
                'status' => $row['status'],
            ]);
        });

        $year = now()->format('Y');

        $quotes = [
            ['status' => 'Draft', 'customer' => 0, 'days' => -3, 'valid' => 21],
            ['status' => 'Sent', 'customer' => 1, 'days' => -12, 'valid' => 14],
            ['status' => 'Accepted', 'customer' => 2, 'days' => -28, 'valid' => 30],
        ];

        foreach ($quotes as $index => $quote) {
            $customer = $customers[$quote['customer']];
            $date = now()->addDays($quote['days']);
            $offer = Offer::create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'offer_number' => 'OFF'.$year.'-'.$company->id.'-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'offer_date' => $date,
                'valid_until' => $date->copy()->addDays($quote['valid']),
                'intro' => '<p>Thank you for considering Offacto for your next project.</p>',
                'desc' => '<p>This quotation outlines the proposed scope, timeline, and investment.</p>',
                'notes' => 'Prices exclude VAT unless stated otherwise.',
                'status' => $offerStatuses[$quote['status']] ?? $offerStatuses['Draft'],
            ]);
            $this->addLineItems($offer, OfferItem::class, $services->random(2)->values());
        }

        $invoicePlans = [
            ['status' => 'Draft', 'payment' => Invoice::PAYMENT_UNPAID, 'days' => -2, 'due' => 30, 'pay' => false],
            ['status' => 'Sent', 'payment' => Invoice::PAYMENT_UNPAID, 'days' => -10, 'due' => 21, 'pay' => false],
            ['status' => 'Paid', 'payment' => Invoice::PAYMENT_PAID, 'days' => -40, 'due' => 14, 'pay' => 'full'],
            ['status' => 'Overdue', 'payment' => Invoice::PAYMENT_UNPAID, 'days' => -45, 'due' => 14, 'pay' => false],
            ['status' => 'Partially Paid', 'payment' => Invoice::PAYMENT_PARTIAL, 'days' => -20, 'due' => 30, 'pay' => 'partial'],
        ];

        foreach ($invoicePlans as $index => $plan) {
            $customer = $customers[$index % $customers->count()];
            $date = now()->addDays($plan['days']);
            $invoice = Invoice::create([
                'company_id' => $company->id,
                'customer_id' => $customer->id,
                'invoice_number' => 'INV'.$year.'-'.$company->id.'-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'invoice_date' => $date,
                'due_date' => $date->copy()->addDays($plan['due']),
                'intro' => '<p>Please find the invoice for the work completed.</p>',
                'desc' => '<p>Payment is due according to the date on this invoice.</p>',
                'notes' => 'Bank transfer preferred.',
                'status' => $invoiceStatuses[$plan['status']] ?? $invoiceStatuses['Draft'],
                'payment_status' => $plan['payment'],
            ]);
            $picked = $services->random(2)->values();
            $this->addLineItems($invoice, InvoiceItem::class, $picked);

            if ($plan['pay'] === 'full') {
                InvoicePayment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => $invoice->fresh(['items'])->total,
                    'payment_date' => $date->copy()->addDays(5),
                    'payment_method' => 'bank_transfer',
                    'reference' => 'TRX-'.str_pad((string) ($index + 11), 4, '0', STR_PAD_LEFT),
                    'notes' => 'Paid in full',
                ]);
            }

            if ($plan['pay'] === 'partial') {
                $fresh = $invoice->fresh(['items']);
                InvoicePayment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => round($fresh->total * 0.4, 2),
                    'payment_date' => $date->copy()->addDays(7),
                    'payment_method' => 'credit_card',
                    'reference' => 'TRX-PARTIAL-'.($index + 1),
                    'notes' => 'First instalment',
                ]);
            }
        }

        $brandService = $services->firstWhere('name', 'Brand strategy workshop') ?? $services->first();
        $devService = $services->firstWhere('name', 'Development (hourly)') ?? $services->get(2);

        $activeBriefing = Briefing::create([
            'company_id' => $company->id,
            'customer_id' => $customers[0]->id,
            'title' => 'Website redesign intake',
            'intro' => 'A few questions so we can prepare an accurate quotation.',
            'status' => Briefing::STATUS_ACTIVE,
            'auto_generate_offer' => true,
            'valid_until_days' => 14,
            'share_token' => Str::random(40),
        ]);
        $this->addBriefingQuestions($activeBriefing, $brandService, $devService);

        $draftBriefing = Briefing::create([
            'company_id' => $company->id,
            'customer_id' => $customers[3]->id,
            'title' => 'Photography briefing (draft)',
            'intro' => 'Draft questions for the upcoming product shoot.',
            'status' => Briefing::STATUS_DRAFT,
            'auto_generate_offer' => false,
            'valid_until_days' => 10,
            'share_token' => Str::random(40),
        ]);
        BriefingQuestion::create([
            'briefing_id' => $draftBriefing->id,
            'sort_order' => 0,
            'type' => BriefingQuestion::TYPE_HEADING,
            'label' => 'Shoot details',
            'required' => false,
        ]);
        BriefingQuestion::create([
            'briefing_id' => $draftBriefing->id,
            'sort_order' => 1,
            'type' => BriefingQuestion::TYPE_SHORT_TEXT,
            'label' => 'Preferred location',
            'required' => true,
        ]);

        $closedBriefing = Briefing::create([
            'company_id' => $company->id,
            'customer_id' => $customers[1]->id,
            'title' => 'Retainer kickoff',
            'intro' => 'Questions we used to scope the monthly retainer.',
            'status' => Briefing::STATUS_CLOSED,
            'auto_generate_offer' => true,
            'valid_until_days' => 14,
            'share_token' => Str::random(40),
        ]);
        $qtyQuestion = BriefingQuestion::create([
            'briefing_id' => $closedBriefing->id,
            'sort_order' => 0,
            'type' => BriefingQuestion::TYPE_QUANTITY,
            'label' => 'Hours of support per month',
            'required' => true,
            'service_id' => $devService->id,
        ]);
        $response = BriefingResponse::create([
            'briefing_id' => $closedBriefing->id,
            'customer_id' => $customers[1]->id,
            'respondent_name' => 'Marcus Hale',
            'respondent_email' => $customers[1]->email,
            'submitted_at' => now()->subDays(6),
        ]);
        BriefingAnswer::create([
            'response_id' => $response->id,
            'question_id' => $qtyQuestion->id,
            'value' => ['value' => 12],
        ]);
    }

    private function addLineItems($parent, string $itemClass, $services): void
    {
        foreach ($services as $service) {
            $qty = $service->unit === 'hour' ? random_int(6, 24) : random_int(1, 2);
            $item = new $itemClass([
                'service_id' => $service->id,
                'description' => $service->description,
                'quantity' => $qty,
                'price' => $service->price,
            ]);
            $item->calculateTotal();
            $parent->items()->save($item);
        }
    }

    private function addBriefingQuestions(Briefing $briefing, Service $brand, Service $dev): void
    {
        BriefingQuestion::create([
            'briefing_id' => $briefing->id,
            'sort_order' => 0,
            'type' => BriefingQuestion::TYPE_HEADING,
            'label' => 'Project goals',
            'required' => false,
        ]);
        BriefingQuestion::create([
            'briefing_id' => $briefing->id,
            'sort_order' => 1,
            'type' => BriefingQuestion::TYPE_LONG_TEXT,
            'label' => 'What should this website achieve?',
            'help_text' => 'Leads, sales, hiring, or something else?',
            'required' => true,
        ]);
        BriefingQuestion::create([
            'briefing_id' => $briefing->id,
            'sort_order' => 2,
            'type' => BriefingQuestion::TYPE_YES_NO,
            'label' => 'Do you need a brand workshop?',
            'required' => true,
            'service_id' => $brand->id,
        ]);
        BriefingQuestion::create([
            'briefing_id' => $briefing->id,
            'sort_order' => 3,
            'type' => BriefingQuestion::TYPE_QUANTITY,
            'label' => 'Estimated development hours',
            'required' => false,
            'service_id' => $dev->id,
        ]);
    }
}
