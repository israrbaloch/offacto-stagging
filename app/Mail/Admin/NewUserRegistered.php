<?php

namespace App\Mail\Admin;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewUserRegistered extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public bool $withCompany
    ) {}

    public function envelope(): Envelope
    {
        $siteName = SiteSetting::get('site_name', 'Offacto');
        return new Envelope(
            subject: "[{$siteName}] New User Registered: {$this->user->email}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new-user-registered',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
