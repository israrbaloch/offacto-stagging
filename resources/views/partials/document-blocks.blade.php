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
            @endphp
            <div style="margin-bottom: 14px;">
                @if($block->type === 'text')
                    <div style="font-size: 9.5pt; color: #64748b; line-height: 1.6; white-space: pre-wrap;">{{ $content['text'] ?? '' }}</div>
                @elseif($block->type === 'image')
                    @php $img = DocumentBlockPdf::imageSrc($content); @endphp
                    @if($img)
                        <img src="{{ $img }}" alt="" style="max-width: 100%; max-height: 280px;">
                    @endif
                @elseif($block->type === 'video' && filled($content['url'] ?? null))
                    <div style="font-size: 9.5pt;">
                        <a href="{{ $content['url'] }}" style="color: {{ $primary }}; text-decoration: underline;">Watch video</a>
                    </div>
                @elseif($block->type === 'table')
                    @php
                        $rows = DocumentBlockPdf::tableRows($content);
                        $head = $rows[0] ?? [];
                        $body = array_slice($rows, 1);
                    @endphp
                    @if(count($rows) > 0)
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
                                @foreach($body as $row)
                                    <tr>
                                        @foreach($row as $cell)
                                            <td style="border: 1px solid #f1f5f9; padding: 6px 8px;">{{ $cell }}</td>
                                        @endforeach
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @endif
                @endif
            </div>
        @endforeach
    </div>
@endif
