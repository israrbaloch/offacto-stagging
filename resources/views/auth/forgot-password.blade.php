{{-- <x-guest-layout>
    <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {{ __('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.') }}
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" :value="old('email')" required autofocus />
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <div class="flex items-center justify-end mt-4">
            <x-primary-button>
                {{ __('Email Password Reset Link') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout> --}}

@extends('layouts.guest')

@section('content')
    <form method="POST" action="{{ route('password.email') }}" id="reset-form">
        @csrf
    </form>
<div class="c-auth-frame__header">
    <a class="c-auth-frame__logo" href="/offacto.com" target="_blank">@svg('logo.offacto')</a>
    <h1 class="c-auth-frame__title">Ultimate all-in-one software for every business.</h1>
</div>

<div class="e-center-frame__frame e-center-frame__frame--480">
    <div class="e-modal__section e-modal__section--small">
        <h2 class="e-modal__title">Request Password</h2>
    </div>
    <div class="e-modal__section e-modal__section--small e-modal__section--bordered">

        <div class="e-modal__desc">
            <p>Enter the email address you registered with. We will send an email with a link where you can reset your password.</p>
        </div>

        <div class="e-form__labels-inside">
            @error('email')
                <div class="e-note e-note--small-spacing e-note--alert mt-2">
                    <div class="e-note__icon e-note__icon--small">
                        @svg('attention')
                    </div>
                    <p class="e-note__text">{{ $message }}</p>
                </div>
            @enderror

            <div class="e-form__field-wrap">
                <label class="e-form__label" for="email">Email</label>
                <input class="e-form__input" id="email" name="email" :value="old('email')" required autofocus type="text" placeholder="your@email.com" form="reset-form"/>
            </div>
        </div>

        <div class="e-form__field-wrap e-form__field-wrap--align-right e-form__field-wrap--checkboxes mt-20">
            <x-primary-button class="e-button e-button--purple" form="reset-form">
                {{ __('Request Password') }}
            </x-primary-button>
        </div>

    </div>
</div>

<div class="e-center-frame__after-frame">
    <p class="c-auth-frame__links"><a href="{{ route('login') }}">Login</a> | <a href="{{url('/')}}" target="_blank">www.offacto.com</a></p>
</div>

@endsection
