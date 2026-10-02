<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ config('app.name') }}</title>
</head>
<body style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.5;">
    <p>{{ __('subscription.email.greeting', ['name' => $company->company_name ?: $company->first_name]) }}</p>

    @if ($kind === 'trial')
        <p>{{ __('subscription.email.trial_body', ['days' => $daysLeft]) }}</p>
    @else
        <p>{{ __('subscription.email.plan_body', ['days' => $daysLeft, 'plan' => $planSlug ? ucfirst($planSlug) : '']) }}</p>
    @endif

    <p>
        <a href="{{ $upgradeUrl }}" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:999px;">
            {{ __('subscription.email.cta') }}
        </a>
    </p>

    <p style="color:#64748b;font-size:13px;">{{ __('subscription.email.footer') }}</p>
</body>
</html>
