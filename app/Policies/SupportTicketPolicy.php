<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function view(User $user, SupportTicket $ticket): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if (! $ticket->company_id) {
            return $ticket->customer_user_id === $user->id;
        }

        return $user->accessibleCompanies()->where('companies.id', $ticket->company_id)->exists();
    }

    public function reply(User $user, SupportTicket $ticket): bool
    {
        if (! $this->view($user, $ticket)) {
            return false;
        }

        return ! in_array($ticket->status, [SupportTicket::STATUS_CLOSED], true);
    }
}
