@php
    $variant = $variant ?? 'dark';
    $width = $width ?? 150;
    $companyLogo = $companyLogo ?? null;
    $src = $companyLogo
        ? $companyLogo
        : ($variant === 'white'
            ? asset('assets/images/logo-offacto-white.svg')
            : asset('assets/images/logo-offacto.svg'));
@endphp
<img src="{{ $src }}" width="{{ $width }}" alt="Logo" style="display:block;border:0;outline:none;height:auto;max-width:{{ $width }}px;">
