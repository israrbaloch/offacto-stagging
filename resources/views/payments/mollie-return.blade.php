<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; color: #0f172a; }
        .card { max-width: 28rem; padding: 2rem; background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); text-align: center; }
        h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
        p { margin: 0; color: #64748b; font-size: 0.9375rem; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        @if($paid)
            <h1>Thank you</h1>
            <p>Your payment was received. You can close this page.</p>
        @else
            <h1>Payment in progress</h1>
            <p>If you completed payment, it may take a moment to confirm. You can close this page.</p>
        @endif
    </div>
</body>
</html>
