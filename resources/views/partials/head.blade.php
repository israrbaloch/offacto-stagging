<head>

        <meta charset="utf-8">
        <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, maximum-scale=1" name="viewport" />
        <meta name="apple-itunes-app" content="app-id=1277082056" />
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>@yield('title', 'Offacto') | Offacto</title>

        {{-- Favicon --}}
        <link rel="icon" type="image/x-icon" href="{{ asset('assets/images/favicon2.ico') }}">
        <link rel="shortcut icon" type="image/x-icon" href="{{ asset('assets/images/favicon2.ico') }}">

        <link rel="stylesheet" href="{{  asset('assets/css/app.css') }}?v={{ uniqid() }}">

        {{-- Chrome bug fix - Prevent CSS transitions on page load --}}
        <script src="/js/chrome-bug-fix.js"></script>
        
        {{-- Company switching script --}}
        @auth
        <script src="{{ asset('js/company-switch.js') }}?v={{ uniqid() }}"></script>
        @endauth

        <style>
            /* Label text styling */
            .e-form__label-text {
                color: #474747;
                font-weight: 500;
            }
            
            /* Required asterisk - red */
            .e-form__label-required {
                color: #ff0000 !important;
                margin-left: 4px;
                font-weight: bold;
            }
            
            /* Input values - different color from labels */
            .e-form__input,
            .e-form__select,
            .e-form__textarea {
                color: #11134E;
                font-weight: 400;
            }
            
            /* Select box styling - remove default browser appearance */
            .e-form__select {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23474747' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 1.5rem center;
                background-size: 1.2rem;
                padding-right: 4rem !important;
                cursor: pointer;
            }
            
            /* Select options styling */
            .e-form__select option {
                background: white !important;
                color: #11134E !important;
                padding: 1rem !important;
                font-size: 1.5rem !important;
                font-family: "LL Circular Book Sub", sans-serif !important;
            }
            
            .e-form__select:focus {
                outline: none;
                border-color: #11134E;
            }
            
            /* Labels inside - increased spacing between label and input */
            .e-form__labels-inside .e-form__label {
                padding-right: 2rem;
                min-width: 13rem;
                max-width: 13rem;
            }
            
            .e-form__labels-inside .e-form__input,
            .e-form__labels-inside .e-form__textarea,
            .e-form__labels-inside .e-form__select-wrap {
                padding-left: 15.5rem !important;
            }
            
            @media (max-width: 767px) {
                .e-form__labels-inside .e-form__label {
                    min-width: 10rem;
                    max-width: 10rem;
                    padding-right: 1.5rem;
                }
                .e-form__labels-inside .e-form__input,
                .e-form__labels-inside .e-form__textarea,
                .e-form__labels-inside .e-form__select-wrap {
                    padding-left: 12rem !important;
                }
            }
            
            /* Color picker layout - better spacing */
            .e-form__input-color-wrap {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                flex-wrap: wrap;
            }
            
            .e-form__labels-inside .e-form__input-color-wrap {
                padding-left: 15.5rem;
                margin-top: 0;
            }
            
            @media (max-width: 767px) {
                .e-form__labels-inside .e-form__input-color-wrap {
                    padding-left: 12rem;
                }
            }
            
            .e-form__input-color-picker {
                cursor: pointer;
                border: 0.1rem solid #E2E2E2;
                border-radius: 0.4rem;
                padding: 0.2rem;
                background: white;
                width: 50px;
                height: 50px;
                flex-shrink: 0;
            }
            
            .e-form__input-color-sample {
                border: 0.1rem solid #E2E2E2;
                border-radius: 0.4rem;
                width: 50px;
                height: 50px;
                flex-shrink: 0;
                display: inline-block;
            }
            
            .e-form__input--color {
                font-family: monospace;
                width: 130px;
                flex-shrink: 0;
            }
            
            /* Button text styling */
            .e-button {
                font-family: "LL Circular Medium Web", sans-serif;
                font-size: 1.5rem;
                font-weight: 500;
                color: white;
            }
            
            .e-button--bordered {
                color: #4054B2;
            }
            
            /* User menu dropdown alignment - fix positioning */
            .c-user-menu {
                position: relative;
            }
            
            .c-user-menu .e-popover {
                right: 0 !important;
                left: auto !important;
                transform: translate(0, 100%);
                margin-top: 0.5rem;
            }
            
            /* Form field spacing */
            .e-form__labels-inside .e-form__field-wrap:not(:last-child) {
                margin-bottom: 1.5rem;
            }
            
            /* Ensure select wrap has proper styling */
            .e-form__select-wrap {
                position: relative;
            }
            
            .e-form__select-wrap::after {
                display: none;
            }
            
            /* Error styling */
            .e-form__error {
                color: #EF6B6B !important;
                font-size: 1.3rem;
                margin-top: 0.5rem;
                display: block;
                font-family: "LL Circular Book Sub", sans-serif;
            }
            
            .e-form__input--error,
            .e-form__select--error {
                border-color: #EF6B6B !important;
            }
            
            .e-form__field-wrap--error .e-form__input,
            .e-form__field-wrap--error .e-form__select {
                border-color: #EF6B6B !important;
            }
            
            /* Active company highlight in sidebar */
            .c-company-switch__list-item--active .c-company-switch__list-link {
                background: #161967;
                font-weight: 500;
            }
            
            .c-company-switch__list-item--active .c-company-switch__list-company-name {
                color: #62BEFF;
            }
            
            /* Red button for delete actions */
            .e-button--red {
                background-color: #EF6B6B !important;
                border-color: #EF6B6B !important;
                color: white !important;
            }
            
            .e-button--red:hover {
                background-color: #e55a5a !important;
                border-color: #e55a5a !important;
            }
            
            /* Table badge for status */
            .c-table__badge {
                display: inline-block;
                padding: 0.4rem 1rem;
                background-color: #f0f0f0;
                color: #474747;
                border-radius: 1.5rem;
                font-size: 1.3rem;
                font-family: "LL Circular Book Sub", sans-serif;
            }
            
            /* Sidebar text white */
            .l-sidebar,
            .c-main-menu__link,
            .c-main-menu__heading,
            .c-company-switch__current-company-name,
            .c-company-switch__list-company-name {
                color: white !important;
            }
            
            .c-main-menu__link:hover {
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .c-main-menu__link--active {
                color: white !important;
                font-weight: 600;
            }
            
            /* ============================================
               COMPANY THEME COLORS - GLOBAL APPLICATION
               Primary (lighter) = Buttons
               Secondary (darker) = Text
            ============================================ */
            
            /* PRIMARY COLOR - All Buttons */
            .e-button {
                background: var(--company-primary) !important;
                border-color: var(--company-primary) !important;
            }
            
            .e-button:hover {
                filter: brightness(1.1);
            }
            
            .e-button--bordered {
                background: transparent !important;
                border-color: var(--company-primary) !important;
                color: var(--company-primary) !important;
            }
            
            .e-button--bordered:hover {
                background: var(--company-primary) !important;
                color: white !important;
            }
            
            .e-button--bordered svg {
                fill: var(--company-primary);
            }
            
            .e-button--bordered:hover svg {
                fill: white;
            }
            
            /* Purple dark button variant */
            .e-button--purple-dark {
                border-color: var(--company-primary) !important;
                color: var(--company-primary) !important;
            }
            
            .e-button--purple-dark:hover {
                background: var(--company-primary) !important;
                color: white !important;
            }
            
            /* Keep red button as is for delete actions */
            .e-button--red {
                background-color: #EF6B6B !important;
                border-color: #EF6B6B !important;
                color: white !important;
            }
            
            .e-button--red:hover {
                background-color: #e55a5a !important;
                border-color: #e55a5a !important;
            }
            
            /* SECONDARY COLOR - All Text */
            .l-page-header__title,
            .e-widget__title,
            .c-harmonica__title,
            .e-form__title,
            .c-table__thead-td,
            .e-modal__title {
                color: var(--company-secondary) !important;
            }
            
            /* Table text */
            .c-table__text,
            .c-table__td {
                color: var(--company-secondary);
            }
            
            /* Form labels */
            .e-form__label-text {
                color: var(--company-secondary) !important;
            }
            
            /* Links using primary color */
            a:not(.e-button):not(.c-main-menu__link):not(.c-table__text) {
                color: var(--company-primary);
            }
            
            a:not(.e-button):not(.c-main-menu__link):not(.c-table__text):hover {
                color: var(--company-secondary);
            }
            
            /* Stats summary */
            .c-stats-summary__list-item span {
                color: var(--company-primary);
            }
            
            /* Pagination */
            .e-pagination__item-number--current {
                background: var(--company-primary) !important;
                border-color: var(--company-primary) !important;
            }
            
            .e-pagination__item-number:hover {
                color: var(--company-primary);
            }
            
            /* Form focus states */
            .e-form__input:focus,
            .e-form__select:focus,
            .e-form__textarea:focus {
                border-color: var(--company-primary) !important;
            }
            
            /* Checkbox and radio */
            .e-form__checkbox:checked + .e-form__checkbox-label::before {
                background: var(--company-primary);
                border-color: var(--company-primary);
            }
            
            /* Widget and card headers */
            .e-widget__title,
            .c-offer-document__title {
                color: var(--company-secondary) !important;
            }
            
            /* Harmonica component */
            .c-harmonica__heading {
                color: var(--company-secondary);
            }
            
            /* Modal styling */
            .e-modal__title {
                color: var(--company-secondary) !important;
            }
            
            /* Note/Alert success using primary */
            .e-note--success {
                border-left-color: var(--company-primary);
            }
            
            /* Services list add button */
            .c-services-list__add-btn {
                background: var(--company-primary) !important;
            }
            
            .c-services-list__add-btn:hover {
                filter: brightness(0.9);
            }
            
            /* Widget empty state */
            .e-widget__empty {
                padding: 2rem;
                text-align: center;
                color: #666;
                font-size: 1.4rem;
            }
            
            .e-widget__empty a {
                color: var(--company-primary, #4054B2);
                text-decoration: underline;
            }
            
            /* Table compact row link */
            .c-table-compact__row-link {
                display: contents;
                text-decoration: none;
                color: inherit;
            }
            
            .c-table-compact__row-link:hover .c-table-compact__td {
                background-color: #f5f5f5;
            }
        </style>

        @stack('styles')

</head>
