@php
    use App\Support\DocumentBlockPdf;

    $blocks = $blocks ?? collect();
    $primary = $primary ?? '#4054b2';
@endphp
@if($blocks->count() > 0)
    <div style="margin-top: 20px;">
        @foreach($blocks as $block)
            @php
                $content = is_array($block->content ?? null) ? $block->content : [];
                $heading = trim((string) ($content['heading'] ?? ''));
                $body = trim((string) ($content['body'] ?? $content['text'] ?? ''));
                $rows = ($block->type === 'table' && ($content['mode'] ?? null) !== 'lines')
                    ? DocumentBlockPdf::tableRows($content)
                    : [];
                $img = $block->type === 'image' ? DocumentBlockPdf::imageSrc($content) : null;
                $visible = ($block->type === 'text' && ($heading !== '' || $body !== ''))
                    || ($block->type === 'image' && $img)
                    || ($block->type === 'video' && filled($content['url'] ?? null))
                    || ($block->type === 'table' && count($rows) > 0);
            @endphp
            @if($visible)
            <div style="margin-bottom: 14px;">
                @if($block->type === 'text')
                    @if($heading !== '')
                        <div style="font-size: 14pt; font-weight: bold; color: #0f172a; margin-bottom: 6px;">{{ $heading }}</div>
                    @endif
                    @if($body !== '')
                        <div style="font-size: 9.5pt; color: #64748b; line-height: 1.6; white-space: pre-wrap;">{{ $body }}</div>
                    @endif
                @elseif($block->type === 'image')
                    <img src="{{ $img }}" alt="" style="max-width: 100%; max-height: 280px;">
                @elseif($block->type === 'video')
                    <div style="font-size: 9.5pt;">
                        <a href="{{ $content['url'] }}" style="color: {{ $primary }}; text-decoration: underline;">Watch video</a>
                    </div>
                @elseif($block->type === 'table')
                    @php
                        $head = $rows[0] ?? [];
                        $tableBody = array_slice($rows, 1);
                    @endphp
                    <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
                        @if(count($head) > 0)
                            <thead>
                                <tr>
                                    @foreach($head as $cell)
                                        <th style="border: 1px solid #e2e8f0; background: #f1f5f9; padding: 6px 8px; text-align: left;">{{ $cell }}</th>
                                    @endforeach
                                </tr>
                            </thead>
                        @endif
                        <tbody>
                            @foreach($tableBody as $row)
                                <tr>
                                    @foreach($row as $cell)
                                        <td style="border: 1px solid #f1f5f9; padding: 6px 8px;">{{ $cell }}</td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            </div>
            @endif
        @endforeach
    </div>
@endif
