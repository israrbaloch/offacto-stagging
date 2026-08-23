@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Company Pending Approval</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4054B2;">New Company Pending Approval</h2>
    
    <p>A new company has been created and is awaiting your approval.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Company Details</h3>
        <p><strong>Company Name:</strong> {{ $company->company_name }}</p>
        <p><strong>Owner:</strong> {{ $company->user->name ?? 'N/A' }}</p>
        <p><strong>Email:</strong> {{ $company->email ?? $company->user->email ?? 'N/A' }}</p>
        <p><strong>Created:</strong> {{ $company->created_at->format('d M Y, H:i') }}</p>
    </div>
    
    <p>Please review and approve or reject this company in the admin panel.</p>
    
    <a href="{{ route('admin.companies.show', $company) }}" 
       style="display: inline-block; background-color: #4054B2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
        Review Company
    </a>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px;">
        This is an automated message from {{ $siteName }}.
    </p>
</body>
</html>
