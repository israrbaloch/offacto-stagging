@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New User Registered</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4054B2;">New User Registered</h2>
    <p>A new user has registered on {{ $siteName }}.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> {{ $user->name }}</p>
        <p><strong>Email:</strong> {{ $user->email }}</p>
        <p><strong>Registered at:</strong> {{ $user->created_at->format('d M Y, H:i') }}</p>
        @if($withCompany)
            <p><strong>Registered with company data.</strong> Company may be pending approval.</p>
        @endif
    </div>
    <p style="color: #666; font-size: 12px;">This is an automated message from {{ $siteName }}.</p>
</body>
</html>
