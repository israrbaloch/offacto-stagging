@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Company Submitted for Approval</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4054B2;">Company Submitted for Approval</h2>
    <p>Hello {{ $company->user->name ?? 'there' }},</p>
    <p>Your company <strong>{{ $company->company_name }}</strong> has been submitted for approval.</p>
    <p>You will receive an email once an administrator has reviewed your company. Until then, you will not be able to access the application with this company.</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br>The {{ $siteName }} Team</p>
    <p style="color: #666; font-size: 12px;">This is an automated message from {{ $siteName }}.</p>
</body>
</html>
