<?php

namespace App\Http\Controllers;

use App\Services\ViesValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ViesValidationController extends Controller
{
    public function store(Request $request, ViesValidationService $vies): JsonResponse
    {
        $user = $request->user();
        if (! $user?->activeCompany()) {
            return response()->json([
                'message' => 'Select or create a company first.',
            ], 422);
        }

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
            throw $e;
        }

        return response()->json([
            'data' => $result,
        ]);
    }
}
