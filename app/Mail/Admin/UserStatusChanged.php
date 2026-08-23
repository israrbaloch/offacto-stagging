<?php

namespace App\Mail\Admin;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public bool $isActive
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $siteName = SiteSetting::get('site_name', 'Offacto');
        $status = $this->isActive ? 'Activated' : 'Deactivated';
        
        return new Envelope(
            subject: "[{$siteName}] Your Account Has Been {$status}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.user-status-changed',
            with: [
                'user' => $this->user,
                'isActive' => $this->isActive,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
