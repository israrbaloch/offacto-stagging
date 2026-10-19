<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\AdminShellInsights;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGlobalSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:120'],
        ]);

        return response()->json([
            'results' => AdminShellInsights::globalSearch($data['q']),
        ]);
    }
}
