<section class="c-harmonica js-harmonica">

	<div class="c-harmonica__heading">
		<div class="c-harmonica__heading-icon">
			@svg('arrow-down')
		</div>
		<h2 class="c-harmonica__heading-title">Bestand</h2>
	</div>

	<div class="c-harmonica__content c-harmonica__content--no-padding">

		{{-- DEV NOTE: Hide after the file is uploaded and scanned
		<div class="e-note mb-20">
			<div class="e-note__icon">
				@svg('info')
			</div>
			<p class="e-note__text">Upload een PDF bestand. Offacto zal het bestand uitlezen en probeert de gegevens automatisch in te vullen.</p>
		</div>

		<div class="e-form__upload-area">
			<input class="e-form__upload-area-input" type="file" name="incoming-pdf" id="incoming-pdf" required="required" multiple="multiple"/>
			<div class="e-form__upload-area-text">
				<div class="e-form__upload-area-text-uploading">Uploading...</div>
				<div class="e-form__upload-area-text-default">Upload PDF bestand</div>
			</div>
		</div>
		 --}}
		

		{{-- DEV NOTE: Show after the file is uploaded and scanned --}}
		<div class="e-form__uploaded-files">
			<img src="/images/file-example.png" />
			<div class="e-form__uploaded-files-buttons">
				<button class="e-button e-button--purple-dark e-button--bordered">Downloaden</button>
				<button class="e-button e-button--purple-dark e-button--bordered">Verwijderen</button>
			</div>
		</div>		

	</div>
</section>