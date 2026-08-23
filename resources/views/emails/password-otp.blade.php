@php
    $siteName = \App\Models\SiteSetting::get('site_name', 'Offacto');
    $formatted = trim(chunk_split($code, 3, ' '));
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Your verification code</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
                    <tr>
                        <td align="center" style="padding:36px 32px 12px;">
                            @include('emails.partials.logo', ['width' => 150])
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:8px 32px 0;color:#0f172a;font-size:26px;font-weight:700;">
                            Your Verification Code
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:12px 40px 28px;color:#64748b;font-size:14px;line-height:22px;">
                            Use this code to complete your password reset. This code will expire in 10 minutes.
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 32px 28px;">
                            <div style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:32px;letter-spacing:8px;font-weight:700;padding:18px 28px;border-radius:12px;">
                                {{ $formatted }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:0 40px 32px;color:#64748b;font-size:13px;line-height:20px;">
                            If you didn't request this code, you can safely ignore this email. Your account remains secure.
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top:1px solid #e2e8f0;padding:20px 32px 28px;color:#94a3b8;font-size:11px;letter-spacing:1px;text-align:center;">
                            SENT BY {{ strtoupper($siteName) }}<br>
                            <span style="display:inline-block;padding-top:10px;letter-spacing:0;color:#94a3b8;">
                                &copy; {{ date('Y') }} {{ $siteName }}. All rights reserved.
                            </span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
