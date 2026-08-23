@extends('app-add')

@section('content')

<h1 class="c-add-frame__title">Template en verzenden</h1>
                
<div class="e-center-frame__frame e-center-frame__frame--560">

    <div class="e-modal__section">

        <h2 class="e-modal__title">E-mail</h2>
        <p class="e-modal__desc">Geef aan waar de offerte naartoe gestuurd moet worden en welke tekst er in de e-mail moet.</p>
		<div class="e-form__labels-inside">
			<div class="e-form__field-wrap">
				<label class="e-form__label" for="mail">E-mail</label>
				<input class="e-form__input" id="mail" type="text" placeholder="uw@email.nl" value="stijn@revaio.com" />
			</div>
		</div>
		<div class="c-add-frame__step-3-template">
			<div class="e-form__field-wrap">
				<label class="e-form__label">Template e-mailtekst</label>
				<div class="e-form__field-wrap">
					<div class="e-form__select-wrap">
						<select class="e-form__select e-form__select--small">
							<option>Revaio standaard offerte</option>
							<option>Revaio standaard offerte</option>
							<option>Revaio standaard offerte</option>
							<option>Revaio standaard offerte</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		<div class="e-form__labels-inside">
			<div class="e-form__field-wrap">
				<label class="e-form__label">Bericht</label>
				<textarea class="e-form__textarea e-form__textarea--medium">
Beste Stijn,

Hierbij ontvangt u een prijsopgave {document.estimate_id} voor mijn diensten.

Met vriendelijke groet,

Stijn Belmans

Revaio B.V.
www.revaio.com
stijn@revaio.com
012345678
				</textarea>
			</div>

		</div>

	</div>
			
    <div class="e-modal__section e-modal__section--bordered">
		<h3 class="e-modal__section-title">Template instellingen</h3>
        <p class="e-modal__desc">Selecteer één van de drie beschikbare templates. Je kan de templates <a href="">hier</a> bekijken.</p>
		<div class="e-form__field-wrap">
			<div class="e-form__select-wrap">
				<select class="e-form__select">
					<option>Template 1</option>
					<option>Template 2</option>
					<option>Template 3</option>
				</select>
			</div>
		</div>
	</div>

</div>



<div class="e-center-frame__after-frame e-center-frame__after-frame--spacing-top">
    <a href="#" class="e-button e-button--white e-button--bordered">Voorbeeld</a>
    <a href="/offerte-toevoegen/stap-3" class="e-button e-button--blue">@svg('send') Verzenden</a>
</div>
	
@endsection