@if($company)
    <form method="POST" action="{{ route('profile.company.update') }}" class="e-form">
        @csrf
        @method('patch')

        <div class="l-grid l-grid--colx2">
            <div class="l-grid__col e-form">
                <h3 class="e-form__title">Company Information</h3>
                <div class="e-form__labels-inside">
                    <x-form.input 
                        name="company_name" 
                        label="Company Name" 
                        :value="old('company_name', $company->company_name)" 
                        required 
                    />

                    <x-form.input 
                        name="vat_number" 
                        label="VAT Number" 
                        :value="old('vat_number', $company->vat_number)" 
                        required 
                    />

                    <x-form.input 
                        name="email" 
                        label="Email" 
                        type="email"
                        :value="old('email', $company->email)" 
                        required 
                    />

                    <x-form.input 
                        name="phone" 
                        label="Phone" 
                        :value="old('phone', $company->phone)" 
                        required 
                    />
                </div>
            </div>

            <div class="l-grid__col e-form">
                <h3 class="e-form__title">Personal Information</h3>
                <div class="e-form__labels-inside">
                    <x-form.input 
                        name="first_name" 
                        label="First Name" 
                        :value="old('first_name', $company->first_name)" 
                        required 
                    />

                    <x-form.input 
                        name="surname" 
                        label="Surname" 
                        :value="old('surname', $company->surname)" 
                        required 
                    />

                    <x-form.select 
                        name="language" 
                        label="Language"
                        :options="$languages"
                        :value="old('language', $company->language)"
                        required
                    />

                    <x-form.select 
                        name="self_employed_activity" 
                        label="Self Employed Activity"
                        :options="[
                            '' => 'Select...',
                            'main_profession' => 'Main Profession',
                            'secondary_profession' => 'Secondary Profession'
                        ]"
                        :value="old('self_employed_activity', $company->self_employed_activity)"
                    />
                </div>
            </div>
        </div>

        <div class="l-grid l-grid--colx2 mt-20">
            <div class="l-grid__col e-form">
                <h3 class="e-form__title">Address Information</h3>
                <div class="e-form__labels-inside">
                    <x-form.input 
                        name="street" 
                        label="Street" 
                        :value="old('street', $company->street)" 
                        required 
                    />

                    <x-form.input 
                        name="house" 
                        label="House Number" 
                        :value="old('house', $company->house)" 
                        required 
                    />

                    <x-form.input 
                        name="postal_code" 
                        label="Postal Code" 
                        :value="old('postal_code', $company->postal_code)" 
                        required 
                    />

                    <x-form.input 
                        name="city" 
                        label="City" 
                        :value="old('city', $company->city)" 
                        required 
                    />
                </div>
            </div>
        </div>

        <div class="e-form__submit-wrap mt-20">
            <button type="submit" class="e-form__submit e-button">Save Company Information</button>
        </div>
    </form>
@else
    <div class="e-note">
        <p class="e-note__text">No company found. Please create a company first.</p>
    </div>
@endif
