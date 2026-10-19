<x-mail::message>
# Support ticket update

**{{ $ticket->reference }}** — {{ $ticket->subject }}

@switch($event)
@case('new_ticket')
A new support ticket was opened.
@break
@case('customer_reply')
A customer replied by email (or a new inbound message was linked to this ticket).
@break
@case('staff_reply')
A team member posted a reply on this ticket.
@break
@case('assigned')
This ticket was assigned or reassigned.
@break
@default
There is an update on this ticket.
@endswitch

@if(!empty($context['snippet']))
**Message excerpt:**  
{{ $context['snippet'] }}
@endif

Priority: **{{ ucfirst($ticket->priority) }}**  
Status: **{{ ucfirst($ticket->status) }}**

<x-mail::button :url="$adminUrl">
Open ticket in admin
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
