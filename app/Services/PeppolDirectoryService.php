<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PeppolDirectoryService
{
    /**
     * Look up a participant in the public Peppol directory.
     * This does not use the company access-point keys.
     *
     * @return array{found: bool, name: ?string, participant_id: ?string, error: ?string}
     */
    public function lookup(string $vatNumber, ?string $countryCode = null): array
    {
        $normalized = strtoupper((string) preg_replace('/[\s.]+/', '', trim($vatNumber)));
        if ($normalized === '') {
            return $this->result(false);
        }

        $country = strtoupper(substr(trim((string) $countryCode), 0, 2));
        if ($country === '' && preg_match('/^([A-Z]{2})/', $normalized, $prefix)) {
            $country = $prefix[1];
        }

        $cacheKey = 'peppol-directory:'.sha1($country.'|'.$normalized);
        $cached = Cache::get($cacheKey);
        if (is_array($cached) && array_key_exists('found', $cached)) {
            return $cached;
        }

        $result = $this->query($normalized, $country);
        if ($result['error'] === null) {
            Cache::put($cacheKey, $result, now()->addHours(6));
        }

        return $result;
    }

    /**
     * @return array{found: bool, name: ?string, participant_id: ?string, error: ?string}
     */
    private function query(string $normalized, string $country): array
    {
        $digits = preg_replace('/\D/', '', $normalized) ?? '';
        $sawTransportError = false;

        foreach ($this->participantIds($country, $normalized, $digits) as $participantId) {
            $response = $this->search(['participant' => 'iso6523-actorid-upis::'.$participantId]);
            if ($response === null) {
                $sawTransportError = true;
                continue;
            }
            $match = $this->firstMatch($response, $digits);
            if ($match) {
                return $this->fromMatch($match);
            }
        }

        if (strlen($digits) >= 8) {
            $response = $this->search(['q' => $digits]);
            if ($response === null) {
                $sawTransportError = true;
            } else {
                $match = $this->firstMatch($response, $digits);
                if ($match) {
                    return $this->fromMatch($match);
                }
            }
        }

        if ($sawTransportError) {
            return $this->result(false, error: 'unavailable');
        }

        return $this->result(false);
    }

    /**
     * @return list<string>
     */
    private function participantIds(string $country, string $normalized, string $digits): array
    {
        $ids = [];

        if ($country === 'BE' || str_starts_with($normalized, 'BE')) {
            $enterprise = $digits;
            if (strlen($enterprise) === 9) {
                $enterprise = '0'.$enterprise;
            }
            if (strlen($enterprise) === 10) {
                $ids[] = '0208:'.$enterprise;
                $ids[] = '9925:BE'.$enterprise;
            }
        } elseif ($country === 'NL' || str_starts_with($normalized, 'NL')) {
            if ($digits !== '') {
                $ids[] = '9944:NL'.$digits;
            }
            if (strlen($digits) === 8) {
                $ids[] = '0106:'.$digits;
            }
        }

        return array_values(array_unique($ids));
    }

    /**
     * @param  array<string, string>  $query
     * @return array<string, mixed>|null
     */
    private function search(array $query): ?array
    {
        try {
            $response = Http::timeout(12)
                ->acceptJson()
                ->get('https://directory.peppol.eu/search/1.0/json', $query);
        } catch (\Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();

        return is_array($payload) ? $payload : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    private function firstMatch(array $payload, string $digits): ?array
    {
        $matches = $payload['matches'] ?? [];
        if (! is_array($matches) || $matches === []) {
            return null;
        }

        if ($digits === '') {
            return is_array($matches[0] ?? null) ? $matches[0] : null;
        }

        foreach ($matches as $match) {
            if (! is_array($match)) {
                continue;
            }
            $value = (string) ($match['participantID']['value'] ?? '');
            if ($value !== '' && str_contains(preg_replace('/\D/', '', $value) ?? '', $digits)) {
                return $match;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $match
     * @return array{found: bool, name: ?string, participant_id: ?string, error: ?string}
     */
    private function fromMatch(array $match): array
    {
        $value = trim((string) ($match['participantID']['value'] ?? ''));
        $name = null;
        $entities = $match['entities'] ?? [];
        if (is_array($entities) && isset($entities[0]) && is_array($entities[0])) {
            $names = $entities[0]['name'] ?? [];
            if (is_array($names) && isset($names[0]['name'])) {
                $name = trim((string) $names[0]['name']);
            } elseif (is_string($names) && $names !== '') {
                $name = trim($names);
            }
        }

        return $this->result(true, $name !== '' ? $name : null, $value !== '' ? $value : null);
    }

    /**
     * @return array{found: bool, name: ?string, participant_id: ?string, error: ?string}
     */
    private function result(bool $found, ?string $name = null, ?string $participantId = null, ?string $error = null): array
    {
        return [
            'found' => $found,
            'name' => $name,
            'participant_id' => $participantId,
            'error' => $error,
        ];
    }
}
