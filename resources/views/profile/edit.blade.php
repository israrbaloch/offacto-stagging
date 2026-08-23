@extends('layouts.app')

@section('title', 'Profile Settings')

@section('content')

    <div class="l-page-header">
        <div class="l-page-header__left-wrap">
            <h1 class="l-page-header__title">Profile Settings</h1>
        </div>
    </div>

    <div class="l-page-content">

        @if(session('status'))
            <div class="e-note e-note--success mb-20">
                <p class="e-note__text">
                    @if(session('status') === 'profile-updated')
                        Profile updated successfully.
                    @elseif(session('status') === 'company-updated')
                        Company information updated successfully.
                    @elseif(session('status') === 'company-settings-updated')
                        Company settings updated successfully.
                    @endif
                </p>
            </div>
        @endif

        @if(session('error'))
            <div class="e-note e-note--error mb-20">
                <p class="e-note__text">{{ session('error') }}</p>
            </div>
        @endif

        <x-form.harmonica title="User Profile" :alwaysOpen="true">
            @include('profile.partials.user-profile-form')
        </x-form.harmonica>

        <x-form.harmonica title="Company Information" :alwaysOpen="true">
            @include('profile.partials.company-form')
        </x-form.harmonica>

        <x-form.harmonica title="Company Settings" :alwaysOpen="true">
            @include('profile.partials.company-settings-form')
        </x-form.harmonica>

    </div>

    @push('scripts')
    <script src="{{ asset('js/profile-forms.js') }}?v={{ uniqid() }}"></script>
    @endpush

@endsection
