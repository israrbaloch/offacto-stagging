@php
    $html = (string) ($html ?? '');
    if ($html === '') {
        $output = '';
    } elseif (strip_tags($html) === $html) {
        $output = nl2br(e($html));
    } else {
        $output = strip_tags($html, '<p><br><b><strong><i><em><u><ul><ol><li><div><span>');
    }
@endphp
{!! $output !!}
