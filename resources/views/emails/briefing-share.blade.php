<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ config('app.name') }}</title>
</head>
<body style="font-family: system-ui, sans-serif; color: #0f172a; line-height: 1.5;">
    <p>{{ __('briefings.share_email.greeting') }}</p>
    @if ($personalMessage)
        <p style="white-space: pre-wrap;">{{ $personalMessage }}</p>
    @endif
    <p>{{ __('briefings.share_email.body', ['title' => $briefing->title]) }}</p>
    <p>
        <a href="{{ $shareUrl }}" style="display:inline-block;padding:10px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:999px;">
            {{ __('briefings.share_email.cta') }}
        </a>
    </p>
</body>
</html>
