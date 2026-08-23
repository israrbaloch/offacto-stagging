@php
    $variant = $variant ?? 'dark';
    $width = $width ?? 150;
    $src = $variant === 'white'
        ? asset('assets/images/logo-offacto-white.svg')
        : asset('assets/images/logo-offacto.svg');
@endphp
<img src="{{ $src }}" width="{{ $width }}" alt="Offacto" style="display:block;border:0;outline:none;height:auto;max-width:{{ $width }}px;">
