<?php

namespace App\Support;

use App\Models\CompanyLegalDocument;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class CompanyLegalDocuments
{
    /** @var list<string> */
    public const SLOTS = ['privacy', 'terms', 'dpa', 'other'];

    public static function normalizeType(string $type): string
    {
        return match ($type) {
            'contract' => 'dpa',
            default => $type,
        };
    }

    /**
     * @param  Collection<int, CompanyLegalDocument>|iterable<int, CompanyLegalDocument>  $documents
     */
    public static function documentForSlot(iterable $documents, string $slot): ?CompanyLegalDocument
    {
        $slot = self::normalizeType($slot);
        $collection = $documents instanceof Collection ? $documents : collect($documents);

        $match = $collection->first(fn (CompanyLegalDocument $doc) => self::normalizeType((string) $doc->type) === $slot);
        if ($match) {
            return $match;
        }

        if ($slot === 'privacy') {
            return $collection->first(function (CompanyLegalDocument $doc) {
                if (self::normalizeType((string) $doc->type) !== 'other') {
                    return false;
                }
                $title = strtolower((string) ($doc->title ?? ''));

                return str_contains($title, 'privacy');
            });
        }

        return null;
    }

    /**
     * @param  Builder<CompanyLegalDocument>  $query
     * @return Collection<int, CompanyLegalDocument>
     */
    public static function defaultsForQuote(Builder $query, ?Customer $customer, ?int $excludeOfferId = null): Collection
    {
        $docs = $query->where('attach_to_quotes_default', true)->get();

        return self::filterNewCustomersOnly($docs, $customer, 'offer', $excludeOfferId);
    }

    /**
     * @param  Builder<CompanyLegalDocument>  $query
     * @return Collection<int, CompanyLegalDocument>
     */
    public static function defaultsForInvoice(Builder $query, ?Customer $customer, ?int $excludeInvoiceId = null): Collection
    {
        $docs = $query->where('attach_to_invoices_default', true)->get();

        return self::filterNewCustomersOnly($docs, $customer, 'invoice', $excludeInvoiceId);
    }

    /**
     * @param  Collection<int, CompanyLegalDocument>  $documents
     * @return Collection<int, CompanyLegalDocument>
     */
    private static function filterNewCustomersOnly(
        Collection $documents,
        ?Customer $customer,
        string $context,
        ?int $excludeId = null,
    ): Collection {
        if (! $customer) {
            return $documents;
        }

        $isNew = self::customerIsNew($customer, $context, $excludeId);

        return $documents->filter(function (CompanyLegalDocument $doc) use ($isNew) {
            if (! $doc->attach_new_customers_only) {
                return true;
            }

            return $isNew;
        })->values();
    }

    private static function customerIsNew(Customer $customer, string $context, ?int $excludeId): bool
    {
        if ($context === 'offer') {
            $query = Offer::where('customer_id', $customer->id);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            return ! $query->exists();
        }

        $query = Invoice::where('customer_id', $customer->id);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return ! $query->exists();
    }
}
