<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="{{ session('appearance') === 'dark' ? 'dark' : '' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'Offacto') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700|figtree:400,500,600,700,800|inter:400,500,600,700|montserrat:500,600,700|source-sans-3:400,500,600,700|urbanist:600,700,800" rel="stylesheet" />
        @php
            $viteManifest = file_exists(public_path('build/manifest.json'));
            $viteHot = app()->environment('local') && file_exists(public_path('hot'));
        @endphp
        @if ($viteManifest || $viteHot)
            @viteReactRefresh
            @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @elseif (app()->environment('local'))
            @viteReactRefresh
            @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @else
            <style>
                body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
                .vite-missing { max-width: 32rem; margin: 3rem auto; padding: 1.5rem 1.75rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 1rem; }
                .vite-missing h1 { font-size: 1.125rem; margin: 0 0 0.75rem; }
                .vite-missing p, .vite-missing li { font-size: 0.875rem; line-height: 1.5; color: #475569; }
                .vite-missing code { font-size: 0.8125rem; background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
            </style>
        @endif
        @inertiaHead
    </head>
    <body class="antialiased">
        @if (! $viteManifest && ! $viteHot && ! app()->environment('local'))
            <div class="vite-missing">
                <h1>Frontend build not found on the server</h1>
                <p>This app needs compiled JavaScript from your computer. On your PC, in the project folder, run:</p>
                <p><code>npm ci</code> then <code>npm run build</code></p>
                <p>Upload the entire folder <code>public/build</code> (including <code>manifest.json</code> and <code>assets/</code>) into <code>offacto/public/build</code> on the server.</p>
                <p>Delete <code>offacto/public/hot</code> if it exists (leftover from local <code>npm run dev</code>).</p>
                <p>Then confirm this URL works in the browser (replace with your domain):</p>
                <p><code>{{ url('/build/manifest.json') }}</code></p>
            </div>
        @endif
        @inertia
    </body>
</html>
