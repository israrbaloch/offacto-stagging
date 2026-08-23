<?php

namespace Database\Seeders;

use App\Models\Status;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddStatuses extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Services statuses
        $serviceStatuses = [
            'Active',
            'Inactive',
            'Pending',
            'Archived',
        ];
        
        foreach ($serviceStatuses as $status) {
            Status::firstOrCreate(
                ['name' => $status, 'for' => 'services'],
                ['name' => $status, 'for' => 'services']
            );
        }

        // Customer statuses
        $customerStatuses = [
            'Active',
            'Inactive',
            'Prospect',
            'Archived',
        ];
        
        foreach ($customerStatuses as $status) {
            Status::firstOrCreate(
                ['name' => $status, 'for' => 'customers'],
                ['name' => $status, 'for' => 'customers']
            );
        }

        // Offer statuses
        $offerStatuses = [
            'Draft',
            'Sent',
            'Accepted',
            'Rejected',
            'Expired',
            'Cancelled',
        ];
        
        foreach ($offerStatuses as $status) {
            Status::firstOrCreate(
                ['name' => $status, 'for' => 'offers'],
                ['name' => $status, 'for' => 'offers']
            );
        }

        // Invoice statuses
        $invoiceStatuses = [
            'Draft',
            'Sent',
            'Paid',
            'Overdue',
            'Cancelled',
            'Partially Paid',
        ];
        
        foreach ($invoiceStatuses as $status) {
            Status::firstOrCreate(
                ['name' => $status, 'for' => 'invoices'],
                ['name' => $status, 'for' => 'invoices']
            );
        }

        // Company statuses
        $companyStatuses = [
            'Pending Approval',
            'Approved',
            'Rejected',
            'Suspended',
        ];
        
        foreach ($companyStatuses as $status) {
            Status::firstOrCreate(
                ['name' => $status, 'for' => 'companies'],
                ['name' => $status, 'for' => 'companies']
            );
        }
    }
}
