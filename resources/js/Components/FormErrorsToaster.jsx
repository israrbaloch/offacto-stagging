import { usePage } from '@inertiajs/react';
import { useFormErrorsToast } from '../lib/formErrors';

/**
 * Maps Inertia shared validation errors → bottom toast (no inline copy).
 */
export default function FormErrorsToaster({ errors: errorsProp, variant = 'error' }) {
    const pageErrors = usePage().props.errors;
    const errors = errorsProp ?? pageErrors;
    useFormErrorsToast(errors, variant);
    return null;
}
