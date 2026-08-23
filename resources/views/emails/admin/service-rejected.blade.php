@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Not Approved</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #11134E, #4054B2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .error-box {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            background: #ffebee;
            border: 2px solid #f44336;
        }
        .error-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .error-text {
            font-size: 20px;
            font-weight: bold;
            color: #c62828;
        }
        .service-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .service-details h3 {
            margin: 0 0 15px 0;
            color: #11134E;
        }
        .service-details p {
            margin: 5px 0;
        }
        .service-details strong {
            display: inline-block;
            width: 100px;
            color: #666;
        }
        .reason-box {
            background: #fff3e0;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
            margin-bottom: 25px;
        }
        .reason-box h4 {
            margin: 0 0 10px 0;
            color: #e65100;
        }
        .message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4054B2;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div style="margin-bottom:12px;">@include('emails.partials.logo', ['variant' => 'white', 'width' => 150])</div>
            <p>Service Review Update</p>
        </div>

        <div class="content">
            <p>Hello {{ $service->company->user->name }},</p>

            <div class="error-box">
                <div class="error-icon">✕</div>
                <div class="error-text">Service Not Approved</div>
            </div>

            <div class="service-details">
                <h3>Service Details</h3>
                <p><strong>Name:</strong> {{ $service->name }}</p>
                <p><strong>Price:</strong> € {{ number_format($service->price, 2, ',', '.') }}</p>
                <p><strong>Company:</strong> {{ $service->company->company_name }}</p>
            </div>

            @if($reason)
            <div class="reason-box">
                <h4>Reason for Rejection</h4>
                <p>{{ $reason }}</p>
            </div>
            @endif

            <div class="message">
                <p>Unfortunately, your service could not be approved at this time.</p>
                <p>You may update the service information and it will be reviewed again.</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated message from <strong>{{ $siteName }}</strong></p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
