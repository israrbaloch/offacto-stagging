@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Approved</title>
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
        .success-box {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            background: #e8f5e9;
            border: 2px solid #4caf50;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .success-text {
            font-size: 20px;
            font-weight: bold;
            color: #2e7d32;
        }
        .company-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .company-details h3 {
            margin: 0 0 15px 0;
            color: #11134E;
        }
        .company-details p {
            margin: 5px 0;
        }
        .company-details strong {
            display: inline-block;
            width: 100px;
            color: #666;
        }
        .message {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
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
            <h1>{{ $siteName }}</h1>
            <p>Company Approval Notification</p>
        </div>

        <div class="content">
            <p>Hello {{ $company->user->name }},</p>

            <div class="success-box">
                <div class="success-icon">✓</div>
                <div class="success-text">Your Company Has Been Approved!</div>
            </div>

            <div class="company-details">
                <h3>Company Details</h3>
                <p><strong>Name:</strong> {{ $company->company_name }}</p>
                <p><strong>Email:</strong> {{ $company->email }}</p>
                @if($company->vat_number)
                <p><strong>VAT:</strong> {{ $company->vat_number }}</p>
                @endif
                <p><strong>Approved:</strong> {{ $company->approved_at ? $company->approved_at->format('d M Y H:i') : 'Just now' }}</p>
            </div>

            <div class="message">
                <p>Congratulations! Your company registration has been approved by our team.</p>
                <p>You can now fully use all features of the platform, including:</p>
                <ul>
                    <li>Creating and managing services</li>
                    <li>Sending offers to customers</li>
                    <li>Creating and sending invoices</li>
                    <li>Managing your customer database</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated message from <strong>{{ $siteName }}</strong></p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
