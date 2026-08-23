@extends('layouts.guest')

@section('content')
<form method="POST" action="{{ route('register') }}" id="register-form">
    @csrf
</form>
<div class="c-auth-frame__header">
    <a class="c-auth-frame__logo" href="/" target="_blank">@svg('logo.offacto')</a>
    <h1 class="c-auth-frame__title">Create your account</h1>
</div>

<div class="e-center-frame__frame e-center-frame__frame--720">
    <div class="e-modal__section e-modal__section--small">
        <h2 class="e-modal__title">Register</h2>
    </div>
    <div class="e-modal__section e-modal__section--small e-modal__section--bordered">
        @if(session('status'))
            <div class="e-note e-note--success mb-20">
                <p class="e-note__text">{{ session('status') }}</p>
            </div>
        @endif
        @if(session('error'))
            <div class="e-note e-note--error mb-20">
                <p class="e-note__text">{{ session('error') }}</p>
            </div>
        @endif

        <h3 class="e-form__title" style="margin-bottom: 1rem;">Account</h3>
        <div class="l-grid l-grid--colx2 mt-10">
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="name" label="Name" :value="old('name')" required autofocus form="register-form" />
                    <x-form.input name="email" label="Email" type="email" :value="old('email')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="password" label="Password" type="password" required form="register-form" />
                    <x-form.input name="password_confirmation" label="Confirm Password" type="password" required form="register-form" />
                </div>
            </div>
        </div>

        <h3 class="e-form__title mt-20" style="margin-bottom: 1rem;">Company (initial)</h3>
        <div class="l-grid l-grid--colx3 mt-10">
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="company_name" label="Company Name" :value="old('company_name')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="first_name" label="First Name" :value="old('first_name')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="surname" label="Surname" :value="old('surname')" required form="register-form" />
                </div>
            </div>
        </div>
        <div class="l-grid l-grid--colx3 mt-10">
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="email_company" label="Company Email" type="email" :value="old('email_company', old('email'))" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="phone" label="Phone" :value="old('phone')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="vat_number" label="VAT Number" :value="old('vat_number')" form="register-form" />
                </div>
            </div>
        </div>
        <div class="l-grid l-grid--colx2 mt-10">
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.select name="language" label="Language" :options="$languages ?? []" :value="old('language')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.select name="self_employed_activity" label="Self Employed Activity" :options="['' => 'Select...', 'main_profession' => 'Main Profession', 'secondary_profession' => 'Secondary Profession']" :value="old('self_employed_activity')" form="register-form" />
                </div>
            </div>
        </div>

        <h3 class="e-form__title mt-20" style="margin-bottom: 1rem;">Address</h3>
        <div class="l-grid l-grid--colx2 mt-10">
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="street" label="Street" :value="old('street')" required form="register-form" />
                    <x-form.input name="house" label="House Number" :value="old('house')" required form="register-form" />
                </div>
            </div>
            <div class="l-grid__col e-form">
                <div class="e-form__labels-floating" data-floating-labels>
                    <x-form.input name="postal_code" label="Postal Code" :value="old('postal_code')" required form="register-form" />
                    <x-form.input name="city" label="City" :value="old('city')" required form="register-form" />
                </div>
            </div>
        </div>

        <div class="e-form__submit-wrap mt-20">
            <button type="submit" class="e-button e-button--purple" form="register-form">Register</button>
        </div>
    </div>
</div>

<div class="e-center-frame__after-frame">
    <p class="c-auth-frame__links"><a href="{{ route('login') }}">Already registered? Log in</a> | <a href="https://www.offacto.com" target="_blank">www.offacto.com</a></p>
</div>

<script>
(function() {
    function updateFloated(wrap) {
        var el = wrap.querySelector('.e-form__input, .e-form__textarea, .e-form__select');
        if (!el) return;
        var hasValue = (el.tagName === 'SELECT') ? el.value !== '' : (el.value || '').trim() !== '';
        wrap.classList.toggle('e-form__field-wrap--floated', hasValue || document.activeElement === el);
    }
    document.querySelectorAll('[data-floating-labels]').forEach(function(container) {
        container.querySelectorAll('.e-form__field-wrap').forEach(function(wrap) {
            var el = wrap.querySelector('.e-form__input, .e-form__textarea, .e-form__select');
            if (!el) return;
            updateFloated(wrap);
            ['input', 'change', 'focus', 'blur'].forEach(function(ev) {
                el.addEventListener(ev, function() { updateFloated(wrap); });
            });
        });
    });
})();
</script>
@endsection
