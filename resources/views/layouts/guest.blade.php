<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class='no-js' lang='nl'>

     @include('partials.head')

    <style>
        :root {
            --company-primary: #4054B2;
            --company-secondary: #454545;
        }
        .c-auth-frame a,
        .e-center-frame__after-frame a {
            color: white !important;
        }
        .c-auth-frame a:hover,
        .e-center-frame__after-frame a:hover {
            color: rgba(255, 255, 255, 0.9) !important;
        }
    </style>

    <body>

        <div class="c-auth-frame e-center-frame">

            <div class="e-center-frame__wrap">

                @yield('content')

            </div>

            <div class="l-bg-waves">
                @svg('bg-wave-1')
                @svg('bg-wave-2')
            </div>

        </div>

        <script src="{{ asset('assets/js/app.js') }}?v={{ uniqid() }}"></script>
    </body>
</html>
