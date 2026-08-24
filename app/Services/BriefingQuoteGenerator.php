<?php

namespace App\Services;

use App\Models\BriefingAnswer;
use App\Models\BriefingQuestion;
use App\Models\BriefingResponse;
use App\Models\Customer;
use App\Models\Offer;
use App\Models\OfferItem;
use App\Models\Service;
use App\Models\Status;
use Illuminate\Support\Facades\DB;

class BriefingQuoteGenerator
{
    public function generate(BriefingResponse $response): ?Offer
    {
        $response->loadMissing(['briefing.company', 'briefing.questions.service', 'answers.question.service', 'offer']);

        if ($response->offer_id && $response->offer) {
            return $response->offer;
        }

        $briefing = $response->briefing;
        if (! $briefing?->auto_generate_offer) {
            return null;
        }

        $customerId = $briefing->customer_id
            ?: $this->matchCustomer($briefing->company_id, $response->respondent_email);

        $draftStatus = Status::where('for', 'offers')->where('name', 'Draft')->first()
            ?? Status::forTable('offers')->first();

        $summary = $this->answerSummary($response);

        return DB::transaction(function () use ($response, $briefing, $customerId, $draftStatus, $summary) {
            $offer = Offer::create([
                'company_id' => $briefing->company_id,
                'customer_id' => $customerId,
                'briefing_response_id' => $response->id,
                'offer_number' => Offer::nextNumber($briefing->company_id),
                'offer_date' => now(),
                'valid_until' => now()->addDays((int) ($briefing->valid_until_days ?: 14)),
                'intro' => $briefing->intro,
                'desc' => $summary,
                'status' => $draftStatus?->id,
            ]);

            foreach ($briefing->questions as $question) {
                $answer = $response->answers->firstWhere('question_id', $question->id);
                $line = $this->lineFromAnswer($question, $answer, $briefing->company_id);
                if (! $line) {
                    continue;
                }

                $item = new OfferItem($line);
                $item->calculateTotal();
                $offer->items()->save($item);
            }

            $response->update([
                'offer_id' => $offer->id,
                'customer_id' => $customerId,
            ]);

            return $offer->fresh(['items.service', 'customer', 'statusRelation']);
        });
    }

    private function matchCustomer(int $companyId, ?string $email): ?int
    {
        if (! $email) {
            return null;
        }

        return Customer::where('company_id', $companyId)
            ->where('email', $email)
            ->value('id');
    }

    private function answerSummary(BriefingResponse $response): string
    {
        $lines = [];
        foreach ($response->briefing->questions as $question) {
            if (in_array($question->type, [BriefingQuestion::TYPE_HEADING], true)) {
                continue;
            }
            $answer = $response->answers->firstWhere('question_id', $question->id);
            $text = $this->displayAnswer($question, $answer);
            if ($text === '') {
                continue;
            }
            $lines[] = $question->label.': '.$text;
        }

        return implode("\n", $lines);
    }

    private function displayAnswer(BriefingQuestion $question, ?BriefingAnswer $answer): string
    {
        if (! $answer) {
            return '';
        }

        $value = $answer->value ?? [];
        return match ($question->type) {
            BriefingQuestion::TYPE_YES_NO => ! empty($value['yes']) ? 'Yes' : 'No',
            BriefingQuestion::TYPE_SINGLE_CHOICE => (string) ($value['label'] ?? $value['text'] ?? ''),
            BriefingQuestion::TYPE_QUANTITY => (string) ($value['quantity'] ?? $value['text'] ?? ''),
            default => (string) ($value['text'] ?? ''),
        };
    }

    private function lineFromAnswer(BriefingQuestion $question, ?BriefingAnswer $answer, int $companyId): ?array
    {
        if (! $answer) {
            return null;
        }

        $value = $answer->value ?? [];

        return match ($question->type) {
            BriefingQuestion::TYPE_YES_NO => $this->yesNoLine($question, $value, $companyId),
            BriefingQuestion::TYPE_SINGLE_CHOICE => $this->choiceLine($question, $value, $companyId),
            BriefingQuestion::TYPE_QUANTITY => $this->quantityLine($question, $value, $companyId),
            default => null,
        };
    }

    private function yesNoLine(BriefingQuestion $question, array $value, int $companyId): ?array
    {
        if (empty($value['yes'])) {
            return null;
        }

        return $this->pricedLine(
            $question->service_id,
            $question->price_override,
            $question->label,
            1,
            $companyId
        );
    }

    private function choiceLine(BriefingQuestion $question, array $value, int $companyId): ?array
    {
        $options = $question->options ?? [];
        $index = $value['index'] ?? null;
        $option = is_numeric($index) ? ($options[(int) $index] ?? null) : null;
        if (! $option && ! empty($value['label'])) {
            $option = collect($options)->firstWhere('label', $value['label']);
        }
        if (! $option) {
            return null;
        }

        $serviceId = $option['service_id'] ?? $question->service_id;
        $price = $option['price'] ?? $question->price_override;
        $label = $question->label.': '.($option['label'] ?? '');

        return $this->pricedLine($serviceId, $price, $label, 1, $companyId);
    }

    private function quantityLine(BriefingQuestion $question, array $value, int $companyId): ?array
    {
        $qty = max(0, (int) ($value['quantity'] ?? 0));
        if ($qty < 1) {
            return null;
        }

        return $this->pricedLine(
            $question->service_id,
            $question->price_override,
            $question->label,
            $qty,
            $companyId
        );
    }

    private function pricedLine(mixed $serviceId, mixed $priceOverride, string $description, int $quantity, int $companyId): ?array
    {
        $service = $serviceId ? Service::where('company_id', $companyId)->find($serviceId) : null;
        $price = $priceOverride !== null && $priceOverride !== ''
            ? (float) $priceOverride
            : (float) ($service?->price ?? 0);

        if (! $service && $price <= 0) {
            return null;
        }

        if (! $service) {
            $service = Service::where('company_id', $companyId)->orderBy('name')->first();
        }

        if (! $service) {
            return null;
        }

        return [
            'service_id' => $service->id,
            'description' => $description,
            'quantity' => $quantity,
            'price' => $price,
        ];
    }
}
