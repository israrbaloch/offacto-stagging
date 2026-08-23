@props([
    'title',
    'subtitle' => null,
    'alwaysOpen' => false,
    'id' => null,
    'class' => '',
])

@php
    $id = $id ?? 'harmonica-' . uniqid();
    $harmonicaClass = $alwaysOpen ? 'c-harmonica c-harmonica--always-open' : 'c-harmonica js-harmonica';
@endphp

<section class="{{ $harmonicaClass }} {{ $class }}" id="{{ $id }}">
    <div class="c-harmonica__heading">
        <div class="c-harmonica__heading-icon">
            @svg('arrow-down')
        </div>
        <h2 class="c-harmonica__heading-title">{{ $title }}</h2>
    </div>

    <div class="c-harmonica__content" style="{{ str_contains($class, 'c-harmonica--is-open') ? 'display: block;' : '' }}">
        @if(isset($subtitle))
        <p class="c-harmonica__subtitle">{{ $subtitle }}</p>
        @endif
        {{ $slot }}
    </div>
</section>
