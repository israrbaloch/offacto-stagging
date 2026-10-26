<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ViesValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegisterViesValidationController extends Controller
{
    public function store(Request $request, ViesValidationService $vies): JsonResponse
    {
        $validated = $request->validate([
            'vat_number' => ['required', 'string', 'max:32'],
            'country_code' => ['nullable', 'string', 'size:2'],
        ]);

        try {
            $result = $vies->validate(
                $validated['vat_number'],
                $validated['country_code'] ?? null,
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }

        if (! $result['valid']) {
            return response()->json([
                'message' => __('customers.vies_not_registered'),
                'data' => $result,
            ], 422);
        }

        return response()->json([
            'data' => $result,
        ]);
    }
}
