@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to {{ $siteName }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="margin-bottom: 20px;">@include('emails.partials.logo', ['width' => 150])</div>
    <h2 style="color: #4054B2;">Welcome to {{ $siteName }}!</h2>
    
    <p>Hi {{ $user->name }},</p>
    
    <p>Thank you for registering with {{ $siteName }}. We're excited to have you on board!</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Getting Started</h3>
        <p>Here are a few things you can do to get started:</p>
        <ul>
            <li>Create your first company profile</li>
            <li>Add your services</li>
            <li>Start creating offers and invoices</li>
        </ul>
    </div>
    
    <a href="{{ route('dashboard') }}" 
       style="display: inline-block; background-color: #4054B2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
        Go to Dashboard
    </a>
    
    <p style="margin-top: 20px;">If you have any questions, feel free to reach out to our support team.</p>
    
    <p>Best regards,<br>The {{ $siteName }} Team</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px;">
        This email was sent to {{ $user->email }} because you registered for an account on {{ $siteName }}.
    </p>
</body>
</html>
