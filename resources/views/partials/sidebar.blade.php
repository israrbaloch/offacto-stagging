<aside class="l-sidebar">

    <div class="c-main-menu">

        @php
            $user = auth()->user();
            $companies = $user->companies()->with('companySetting')->get();
            $activeCompany = $user->activeCompany();
            $activeCompanySettings = $activeCompany?->companySetting;
            $activeCompanyId = $activeCompany?->id;
        @endphp

        @if ($companies->count() > 0)
            <div class="c-company-switch">

                <div class="c-company-switch__current-company">
                    @if ($activeCompanySettings && $activeCompanySettings->invoice_logo)
                        <img class="c-company-switch__current-company-image"
                            src="{{ asset('storage/' . $activeCompanySettings->invoice_logo) }}"
                            alt="{{ $activeCompany->company_name ?? 'Company' }}" />
                    @else
                        <img class="c-company-switch__current-company-image" src="/images/no-image.svg" alt="No logo" />
                    @endif
                    <p class="c-company-switch__current-company-name">{{ $activeCompany->company_name ?? 'No Company' }}
                    </p>
                    @svg('arrow-down')
                </div>

                @if ($companies->count() > 1)
                    <ul class="c-company-switch__list">
                        @foreach ($companies as $company)
                            @php
                                $companySettings = $company->companySetting;
                                $isActive = $company->id === $activeCompanyId;
                            @endphp
                            <li class="c-company-switch__list-item {{ $isActive ? 'c-company-switch__list-item--active' : '' }}"
                                data-company-id="{{ $company->id }}">
                                <a class="c-company-switch__list-link company-switch-link" href="#"
                                    data-company-id="{{ $company->id }}">
                                    @if ($companySettings && $companySettings->invoice_logo)
                                        <img class="c-company-switch__list-company-image"
                                            src="{{ asset('storage/' . $companySettings->invoice_logo) }}"
                                            alt="{{ $company->company_name }}" />
                                    @else
                                        <img class="c-company-switch__list-company-image" src="/images/no-image.svg"
                                            alt="No logo" />
                                    @endif
                                    <p class="c-company-switch__list-company-name">{{ $company->company_name }}</p>
                                </a>
                            </li>
                        @endforeach
                    </ul>
                @endif

            </div>
        @endif

        <nav class="c-main-menu__nav mt-5">

            <ul class="c-main-menu__list">
                @if (auth()->user()->hasRole('staff'))
                    <li class="c-main-menu__list-item">
                        {{-- DEV NOTE: Add class 'c-main-menu__link--active' at link of the current page --}}
                        <a class="c-main-menu__link {{ request()->routeIs('dashboard') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('dashboard') }}">Dashboard</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('invoices.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('invoices.index') }}">Invoices</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('offers.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('offers.index') }}">Offers</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('customers.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('customers.index') }}">Customers</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('services.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('services.index') }}">Services</a>
                    </li>
                @endif

                @if (auth()->user()->hasRole('admin'))
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('admin.dashboard') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('admin.dashboard') }}">Dashboard</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('admin.users.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('admin.users.index') }}">Users</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('admin.companies.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('admin.companies.index') }}">Companies</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('admin.services.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('admin.services.index') }}">Services</a>
                    </li>
                    <li class="c-main-menu__list-item">
                        <a class="c-main-menu__link {{ request()->routeIs('admin.settings.*') ? 'c-main-menu__link--active' : '' }}"
                            href="{{ route('admin.settings.index') }}">Site Settings</a>
                    </li>
                @endif

            </ul>

            <ul class="c-main-menu__list">
                <li class="c-main-menu__list-item">
                    <p class="c-main-menu__heading">Management</p>
                </li>
                <li class="c-main-menu__list-item">
                    <a class="c-main-menu__link {{ request()->routeIs('companies.*') ? 'c-main-menu__link--active' : '' }}"
                        href="{{ route('companies.index') }}">Companies</a>
                </li>
                <li class="c-main-menu__list-item">
                    <a class="c-main-menu__link" href="/team">Team</a>
                </li>
                <li class="c-main-menu__list-item">
                    <a class="c-main-menu__link" href="/abonnement">Subscription</a>
                </li>
            </ul>

        </nav>

    </div>

</aside>
