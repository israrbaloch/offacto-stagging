@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Status Update</title>
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
        .status-box {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .status-box.active {
            background: #e8f5e9;
            border: 2px solid #4caf50;
        }
        .status-box.inactive {
            background: #ffebee;
            border: 2px solid #f44336;
        }
        .status-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .status-text {
            font-size: 20px;
            font-weight: bold;
        }
        .status-box.active .status-text {
            color: #2e7d32;
        }
        .status-box.inactive .status-text {
            color: #c62828;
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
        .footer a {
            color: #4054B2;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div style="margin-bottom:12px;">@include('emails.partials.logo', ['variant' => 'white', 'width' => 150])</div>
            <p>Account Status Update</p>
        </div>

        <div class="content">
            <p>Hello {{ $user->name }},</p>

            <div class="status-box {{ $isActive ? 'active' : 'inactive' }}">
                <div class="status-icon">{{ $isActive ? '✓' : '✕' }}</div>
                <div class="status-text">
                    Your account has been {{ $isActive ? 'activated' : 'deactivated' }}
                </div>
            </div>

            <div class="message">
                @if($isActive)
                    <p>Great news! Your account has been activated. You now have full access to all features.</p>
                    <p>You can log in and start using the platform immediately.</p>
                @else
                    <p>Your account has been temporarily deactivated by an administrator.</p>
                    <p>If you believe this was done in error or have any questions, please contact our support team.</p>
                @endif
            </div>
        </div>

        <div class="footer">
            <p>This is an automated message from <strong>{{ $siteName }}</strong></p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
