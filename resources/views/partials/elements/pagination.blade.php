@if(isset($offers) && $offers instanceof \Illuminate\Pagination\LengthAwarePaginator && $offers->hasPages())
<ul class="e-pagination">
	{{-- Previous Page Link --}}
	@if(!$offers->onFirstPage())
	<li class="e-pagination__item">
		<a class="e-pagination__item-number" href="{{ $offers->previousPageUrl() }}">«</a>
	</li>
	@endif

	{{-- Page Numbers --}}
	@foreach($offers->getUrlRange(1, $offers->lastPage()) as $page => $url)
		@if($page == $offers->currentPage())
		<li class="e-pagination__item">
			<a class="e-pagination__item-number e-pagination__item-number--current" href="#">{{ $page }}</a>
		</li>
		@elseif($page == 1 || $page == $offers->lastPage() || abs($page - $offers->currentPage()) <= 2)
		<li class="e-pagination__item">
			<a class="e-pagination__item-number" href="{{ $url }}">{{ $page }}</a>
		</li>
		@elseif($page == 2 && $offers->currentPage() > 4)
		<li class="e-pagination__item">
			<p class="e-pagination__item-number">...</p>
		</li>
		@elseif($page == $offers->lastPage() - 1 && $offers->currentPage() < $offers->lastPage() - 3)
		<li class="e-pagination__item">
			<p class="e-pagination__item-number">...</p>
		</li>
		@endif
	@endforeach

	{{-- Next Page Link --}}
	@if($offers->hasMorePages())
	<li class="e-pagination__item">
		<a class="e-pagination__item-number" href="{{ $offers->nextPageUrl() }}">»</a>
	</li>
	@endif
</ul>
@endif
