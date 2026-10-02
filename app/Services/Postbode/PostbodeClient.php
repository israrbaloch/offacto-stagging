<?php

namespace App\Services\Postbode;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class PostbodeClient
{
    public function __construct(private readonly string $bearerToken) {}

    /**
     * @return array<string, mixed>
     */
    public function verifyConnection(string $mailboxCode): array
    {
        return $this->get("/mailbox/{$mailboxCode}");
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createPostal(array $payload): array
    {
        return $this->post('/postal', $payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function sendV1Letter(int $mailboxId, array $payload): array
    {
        $response = Http::withHeaders([
            'X-Authorization' => $this->bearerToken,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post("https://app.postbode.nu/api/mailbox/{$mailboxId}/letters", $payload);

        return $this->parseResponse($response);
    }

    /**
     * @return array<string, mixed>
     */
    private function get(string $path): array
    {
        $response = Http::withToken($this->bearerToken)
            ->acceptJson()
            ->get($this->v2Base().$path);

        return $this->parseResponse($response);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function post(string $path, array $payload): array
    {
        $response = Http::withToken($this->bearerToken)
            ->acceptJson()
            ->post($this->v2Base().$path, $payload);

        return $this->parseResponse($response);
    }

    private function v2Base(): string
    {
        return rtrim(config('services.postbode.v2_base', 'https://postbode.app/api/v2'), '/');
    }

    /**
     * @return array<string, mixed>
     */
    private function parseResponse(Response $response): array
    {
        $body = $response->json() ?? [];

        if ($response->successful()) {
            return is_array($body) ? $body : ['data' => $body];
        }

        $message = is_string($body['message'] ?? null)
            ? $body['message']
            : 'Postbode API request failed.';

        $errors = is_array($body['errors'] ?? null) ? $body['errors'] : [];

        throw new PostbodeApiException($message, $response->status(), $errors);
    }
}
