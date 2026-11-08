<?php

namespace App\Http\Controllers;

use App\Services\PeppolDirectoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeppolLookupController extends Controller
{
    public function show(Request $request, PeppolDirectoryService $directory): JsonResponse
    {
        if (! $request->user()?->activeCompany()) {
            return response()->json([
                'message' => 'Select or create a company first.',
            ], 422);
        }

        $validated = $request->validate([
            'vat' => ['required', 'string', 'max:32'],
            'country' => ['nullable', 'string', 'max:2'],
        ]);

        return response()->json([
            'data' => $directory->lookup($validated['vat'], $validated['country'] ?? null),
        ]);
    }
}
