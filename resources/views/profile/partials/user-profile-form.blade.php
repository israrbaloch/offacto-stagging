<form method="POST" action="{{ route('profile.update') }}" class="e-form">
    @csrf
    @method('patch')

    <div class="e-form__labels-inside">
        <x-form.input 
            name="name" 
            label="Name" 
            :value="old('name', $user->name)" 
            required 
        />

        <x-form.input 
            name="email" 
            label="Email" 
            type="email"
            :value="old('email', $user->email)" 
            required 
        />

        <x-form.input 
            name="password" 
            label="New Password" 
            type="password"
            placeholder="Leave blank to keep current password"
        />

        <x-form.input 
            name="password_confirmation" 
            label="Confirm Password" 
            type="password"
        />
    </div>

    <div class="e-form__submit-wrap mt-20">
        <button type="submit" class="e-form__submit e-button">Save Changes</button>
    </div>
</form>
