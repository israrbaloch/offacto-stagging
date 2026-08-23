@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Service Pending Approval</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4054B2;">New Service Pending Approval</h2>
    
    <p>A new service has been created and is awaiting your approval.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Service Details</h3>
        <p><strong>Service Name:</strong> {{ $service->name }}</p>
        <p><strong>Company:</strong> {{ $service->company->company_name ?? 'N/A' }}</p>
        <p><strong>Price:</strong> €{{ number_format($service->price, 2) }}</p>
        <p><strong>Description:</strong> {{ $service->description ?? 'No description' }}</p>
        <p><strong>Created:</strong> {{ $service->created_at->format('d M Y, H:i') }}</p>
    </div>
    
    <p>Please review and approve or reject this service in the admin panel.</p>
    
    <a href="{{ route('admin.services.show', $service) }}" 
       style="display: inline-block; background-color: #4054B2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
        Review Service
    </a>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 12px;">
        This is an automated message from {{ $siteName }}.
    </p>
</body>
</html>
