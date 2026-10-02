<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompanyIntegrationsRequest;
use App\Services\Postbode\PostbodeApiException;
use App\Services\Postbode\PostbodeClient;
use App\Support\CompanyIntegrations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CompanyIntegrationsController extends Controller
{
    public function update(UpdateCompanyIntegrationsRequest $request): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        $settings = CompanyIntegrations::settings($company);

        if (! $settings) {
            return back()->with('error', 'Company settings could not be loaded.');
        }

        $data = $request->validated();
        $data['postbode_registered'] = $request->boolean('postbode_registered');
        $data['postbode_send_immediately'] = $request->boolean('postbode_send_immediately');
        $data['postbode_default_country'] = strtoupper($data['postbode_default_country'] ?? 'NL');

        if (! filled($data['mollie_test_key'] ?? null)) {
            unset($data['mollie_test_key']);
        }
        if (! filled($data['mollie_live_key'] ?? null)) {
            unset($data['mollie_live_key']);
        }
        if (! filled($data['postbode_test_token'] ?? null)) {
            unset($data['postbode_test_token']);
        }
        if (! filled($data['postbode_live_token'] ?? null)) {
            unset($data['postbode_live_token']);
        }

        $settings->update($data);

        return back()->with('status', 'company-integrations-saved');
    }

    public function testPostbode(Request $request): JsonResponse|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        $settings = CompanyIntegrations::settings($company);

        if (! $settings || ! CompanyIntegrations::postbodeConfigured($company)) {
            return $this->testResponse($request, false, 'Configure Postbode token, mailbox, and envelope first.');
        }

        $token = CompanyIntegrations::postbodeToken($settings);
        $client = new PostbodeClient($token);

        try {
            if ($settings->postbode_api_version === 'v1') {
                return $this->testResponse($request, true, 'Legacy API token saved. Send a test letter from Postbode to validate mailbox access.');
            }

            $mailbox = $settings->postbode_mailbox_code;
            $client->verifyConnection($mailbox);

            return $this->testResponse($request, true, 'Connected to Postbode mailbox '.$mailbox.'.');
        } catch (PostbodeApiException $e) {
            return $this->testResponse($request, false, $e->getMessage());
        }
    }

    private function testResponse(Request $request, bool $ok, string $message): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['ok' => $ok, 'message' => $message], $ok ? 200 : 422);
        }

        return back()->with($ok ? 'status' : 'error', $ok ? 'postbode-connection-ok' : $message);
    }
}
