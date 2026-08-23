{{-- <x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="mt-4">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            name="password"
                            required autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>

        <!-- Remember Me -->
        <div class="block mt-4">
            <label for="remember_me" class="inline-flex items-center">
                <input id="remember_me" type="checkbox" class="rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800" name="remember">
                <span class="ms-2 text-sm text-gray-600 dark:text-gray-400">{{ __('Remember me') }}</span>
            </label>
        </div>

        <div class="flex items-center justify-end mt-4">
            @if (Route::has('password.request'))
                <a class="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" href="{{ route('password.request') }}">
                    {{ __('Forgot your password?') }}
                </a>
            @endif

            <x-primary-button class="ms-3">
                {{ __('Log in') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout> --}}


@extends('layouts.guest')

@section('content')
<form method="POST" action="{{ route('login') }}" id="login-form">
    @csrf
</form>
<div class="c-auth-frame__header">
    <a class="c-auth-frame__logo" href="/" target="_blank">@svg('logo.offacto')</a>
    <h1 class="c-auth-frame__title">Ultimate all-in-one software for every business.</h1>
</div>

<div class="e-center-frame__frame e-center-frame__frame--480">
    <div class="e-modal__section e-modal__section--small">
        <h2 class="e-modal__title">Login</h2>
    </div>
    <div class="e-modal__section e-modal__section--small e-modal__section--bordered">

        @error('email')
            <div class="e-note e-note--small-spacing e-note--alert mt-2">
                <div class="e-note__icon e-note__icon--small">
                    @svg('attention')
                </div>
                <p class="e-note__text">{{ $message }}</p>
            </div>
        @enderror
        @error('password')
            <div class="e-note e-note--small-spacing e-note--alert mt-2">
                <div class="e-note__icon e-note__icon--small">
                    @svg('attention')
                </div>
                <p class="e-note__text">{{ $message }}</p>
            </div>
        @enderror

        <div class="e-form__labels-inside">
            <div class="e-form__field-wrap @error('email') e-form__field-wrap--invalid @enderror">
                <label class="e-form__label" for="email">Email</label>
                <input class="e-form__input" id="email" type="email" placeholder="your@email.com" form="login-form" name="email" :value="old('email')" required autofocus autocomplete="username"/>
            </div>
            <div class="e-form__field-wrap @error('password') e-form__field-wrap--invalid @enderror">
                <label class="e-form__label" for="password">Password</label>
                <input class="e-form__input" id="password"  type="password" name="password" required autocomplete="current-password" placeholder="*******" form="login-form"/>
            </div>
        </div>

        <div class="e-form__field-wrap e-form__field-wrap--checkboxes mt-20">
            <div class="e-form__multiple-checkboxes">
                <label class="e-form__checkbox-wrap">
                    <input class="e-form__checkbox" type="checkbox" name="remember" form="login-form" />
                    <span class="e-form__checkbox-label"></span>
                    <span class="e-form__checkbox-text">Stay logged in</span>
                </label>
            </div>
            <button type="submit" class="e-button e-button--purple" form="login-form">Login</button>
        </div>

    </div>
</div>

<div class="e-center-frame__after-frame">
    <p class="c-auth-frame__links"><a href="/forgot-password">Forgot password</a>@if($allowRegistration ?? true) | <a href="{{ route('register') }}">Register</a>@endif | <a href="https://www.offacto.com" target="_blank">www.offacto.com</a></p>
</div>

@endsection
