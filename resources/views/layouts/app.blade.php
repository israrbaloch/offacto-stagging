<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class='no-js' lang='en'>
    
     @include('partials.head')

    @php
        $user = auth()->user();
        $activeCompany = $user ? $user->activeCompany() : null;
        $companySettings = $activeCompany?->companySetting;
        $theme = $companySettings?->theme ?? ['primary' => '#4054B2', 'secondary' => '#454545'];
        
        // Ensure theme is an array
        if (is_string($theme)) {
            $theme = json_decode($theme, true) ?? ['primary' => '#4054B2', 'secondary' => '#454545'];
        }
        
        $primaryColor = $theme['primary'] ?? '#4054B2';
        $secondaryColor = $theme['secondary'] ?? '#454545';
        $hasMultipleCompanies = $user && $user->companies()->count() > 1;
    @endphp

    <style>
        :root {
            --company-primary: {{ $primaryColor }};
            --company-secondary: {{ $secondaryColor }};
        }
        
        body {
            background: linear-gradient(117deg, {{ $primaryColor }} 0%, {{ $secondaryColor }} 96%);
        }
    </style>

    <body class="{{ $hasMultipleCompanies ? 'body--user-has-multiple-companies' : '' }}">

        @include('partials.header')
        @include('partials.modals.add-hours')

        <div class="l-flex-wrapper">

            @include('partials.sidebar')

            <main class="l-main">
                @yield('content')

                <div class="l-bg-waves">
                    @svg('bg-wave-1')
                    @svg('bg-wave-2')
                <div>
            </main>

        </div>

        <script src="/js/app.js?v={{ uniqid() }}"></script>
        @stack('scripts')
    </body>
</html>
