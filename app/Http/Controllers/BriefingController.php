<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBriefingRequest;
use App\Models\Briefing;
use App\Models\BriefingQuestion;
use App\Models\Customer;
use App\Models\Service;
use App\Models\BriefingResponse;
use App\Mail\BriefingShareMail;
use App\Services\BriefingQuoteGenerator;
use App\Support\CompanyAccess;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class BriefingController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        $briefings = Briefing::where('company_id', $company->id)
            ->with(['customer'])
            ->withCount(['questions', 'responses'])
            ->withMax('responses', 'submitted_at')
            ->latest()
            ->paginate(15)
            ->through(fn (Briefing $briefing) => [
                'id' => $briefing->id,
                'title' => $briefing->title,
                'status' => $briefing->status,
                'responses_count' => $briefing->responses_count,
                'responses_max_submitted_at' => $this->carbonize($briefing->responses_max_submitted_at)?->toIso8601String(),
                'public_link' => $this->briefingPublicLink($briefing),
                'card_subtitle' => $this->briefingCardSubtitle($briefing),
            ]);

        $recentResponses = BriefingResponse::query()
            ->whereHas('briefing', fn ($query) => $query->where('company_id', $company->id))
            ->with(['briefing', 'customer', 'offer.statusRelation'])
            ->latest('submitted_at')
            ->take(10)
            ->get()
            ->map(function (BriefingResponse $response) {
                $customer = $this->customerDisplayLabel($response->customer, $response->respondent_name);
                $quoteStatus = $this->responseQuoteStatus($response);

                return [
                    'id' => $response->id,
                    'briefing_id' => $response->briefing_id,
                    'briefing_title' => $response->briefing?->title,
                    'submitted_at' => $response->submitted_at?->toIso8601String(),
                    'customer_name' => $customer['name'],
                    'customer_initials' => $customer['initials'],
                    'estimate' => $response->offer?->total,
                    'offer_id' => $response->offer_id,
                    'quote_status' => $quoteStatus,
                    'quote_action' => $this->responseQuoteAction($quoteStatus),
                    'draft_quote_ready' => $response->offer_id
                        && $quoteStatus['key'] === 'draft',
                ];
            });

        return Inertia::render('Briefings/Index', [
            'briefings' => $briefings,
            'recentResponses' => $recentResponses,
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        if ($deny = CompanyAccess::denyCreate($request->user(), $company, 'briefings', 'briefings.create')) {
            return $deny;
        }

        $briefing = Briefing::create([
            'company_id' => $company->id,
            'title' => 'Untitled briefing',
            'status' => Briefing::STATUS_DRAFT,
            'auto_generate_offer' => true,
            'valid_until_days' => 14,
        ]);

        return redirect()->route('briefings.edit', $briefing);
    }

    public function edit(Request $request, Briefing $briefing): Response|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $briefing->load(['questions.service', 'customer', 'company']);

        return Inertia::render('Briefings/Edit', [
            'briefing' => $briefing,
            'shareUrl' => $briefing->publicUrl(),
        ]);
    }

    public function duplicate(Request $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        if ($deny = CompanyAccess::denyCreate($request->user(), $company, 'briefings', 'briefings.create')) {
            return $deny;
        }

        $copy = $briefing->replicate(['share_token']);
        $copy->title = trim($briefing->title.' '.__('briefings.copy_suffix'));
        $copy->status = Briefing::STATUS_DRAFT;
        $copy->save();

        foreach ($briefing->questions as $question) {
            $copy->questions()->create([
                'sort_order' => $question->sort_order,
                'type' => $question->type,
                'label' => $question->label,
                'help_text' => $question->help_text,
                'required' => $question->required,
                'service_id' => $question->service_id,
                'price_override' => $question->price_override,
                'options' => $question->options ?? [],
            ]);
        }

        return redirect()->route('briefings.edit', $copy)->with('status', 'briefing-duplicated');
    }

    public function archive(Request $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $briefing->update(['status' => Briefing::STATUS_CLOSED]);

        return back()->with('status', 'briefing-archived');
    }

    public function share(Request $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validate([
            'emails' => ['required', 'array', 'min:1', 'max:25'],
            'emails.*' => ['required', 'email', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $shareUrl = $briefing->publicUrl();
        $message = $data['message'] ?? null;

        foreach (array_unique($data['emails']) as $email) {
            Mail::to($email)->send(new BriefingShareMail($briefing, $shareUrl, $message));
        }

        return back()->with('status', 'briefing-shared');
    }

    public function update(UpdateBriefingRequest $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $data = $request->validated();
        $briefing->update([
            'title' => $data['title'] ?? $briefing->title,
            'base_price' => $data['base_price'] ?? $briefing->base_price,
            'form_locale' => $data['form_locale'] ?? $briefing->form_locale,
            'auto_generate_offer' => $data['auto_generate_offer'] ?? $briefing->auto_generate_offer,
            'ai_writes_intro' => $data['ai_writes_intro'] ?? $briefing->ai_writes_intro,
            'require_nda_before_start' => $data['require_nda_before_start'] ?? $briefing->require_nda_before_start,
            'valid_until_days' => $data['valid_until_days'] ?? $briefing->valid_until_days,
            'status' => $data['status'] ?? $briefing->status,
        ]);

        $keepIds = [];
        foreach ($data['questions'] ?? [] as $index => $row) {
            $payload = [
                'sort_order' => $index,
                'type' => $row['type'],
                'label' => $row['label'],
                'help_text' => null,
                'required' => (bool) ($row['required'] ?? false),
                'service_id' => null,
                'price_override' => $row['price_override'] ?? null,
                'options' => collect($row['options'] ?? [])
                    ->map(fn ($option) => [
                        'label' => $option['label'] ?? '',
                        'price' => $option['price'] ?? null,
                    ])
                    ->values()
                    ->all(),
            ];

            if (! empty($row['id'])) {
                $question = $briefing->questions()->where('id', $row['id'])->first();
                if ($question) {
                    $question->update($payload);
                    $keepIds[] = $question->id;
                    continue;
                }
            }

            $question = $briefing->questions()->create($payload);
            $keepIds[] = $question->id;
        }

        $briefing->questions()->whereNotIn('id', $keepIds ?: [0])->delete();

        return back()->with('status', 'briefing-updated');
    }

    public function destroy(Request $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $briefing->delete();

        return redirect()->route('briefings.index')->with('status', 'briefing-deleted');
    }

    public function responses(Request $request, Briefing $briefing): Response|RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        $briefing->load(['customer']);
        $responses = $briefing->responses()
            ->with(['offer.statusRelation', 'customer', 'answers.question'])
            ->latest('submitted_at')
            ->get()
            ->map(function (BriefingResponse $response) {
                $quoteStatus = $this->responseQuoteStatus($response);

                return [
                    'id' => $response->id,
                    'respondent_name' => $response->respondent_name,
                    'respondent_email' => $response->respondent_email,
                    'submitted_at' => $response->submitted_at?->toIso8601String(),
                    'customer' => $response->customer,
                    'offer' => $response->offer ? [
                        'id' => $response->offer->id,
                        'offer_number' => $response->offer->offer_number,
                        'status_relation' => $response->offer->statusRelation ? [
                            'name' => $response->offer->statusRelation->name,
                        ] : null,
                    ] : null,
                    'answers' => $response->answers->map(fn ($answer) => [
                        'id' => $answer->id,
                        'question_label' => $answer->question?->label,
                        'question_type' => $answer->question?->type,
                        'display' => app(BriefingQuoteGenerator::class)->formatAnswerForDisplay($answer),
                        'file_name' => $answer->value['original_name'] ?? null,
                    ]),
                    'quote_status' => $quoteStatus,
                    'quote_action' => $this->responseQuoteAction($quoteStatus),
                ];
            });

        return Inertia::render('Briefings/Responses', [
            'briefing' => $briefing,
            'responses' => $responses,
            'autoGenerateOffer' => $briefing->auto_generate_offer,
        ]);
    }

    public function generateQuote(Request $request, Briefing $briefing, BriefingResponse $response, BriefingQuoteGenerator $generator): RedirectResponse
    {
        $company = $request->user()?->activeCompany();
        if (! $company || $briefing->company_id !== $company->id || $response->briefing_id !== $briefing->id) {
            abort(403);
        }

        if ($deny = CompanyAccess::denyWrite($request->user(), $company, false, 'briefings.generate_quote')) {
            return $deny;
        }
        if ($deny = CompanyAccess::denyCreate($request->user(), $company, 'offers', 'offers.create')) {
            return $deny;
        }

        if ($response->offer_id) {
            return redirect()->route('offers.edit', $response->offer_id)
                ->with('status', 'briefing-quote-exists');
        }

        $response->load(['answers.question', 'briefing.questions.service']);
        $offer = $generator->generate($response, manual: true);

        if (! $offer) {
            return back()->with('error', 'Could not generate a quotation. Add priced answers or assign a customer first.');
        }

        return redirect()->route('offers.edit', $offer)
            ->with('status', 'briefing-quote-generated');
    }

    private function carbonize(mixed $value): ?Carbon
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value;
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value);
        }

        if (is_string($value)) {
            return Carbon::parse($value);
        }

        return null;
    }

    private function briefingPublicLink(Briefing $briefing): ?string
    {
        if ($briefing->status !== Briefing::STATUS_ACTIVE) {
            return null;
        }

        $host = parse_url(config('app.url'), PHP_URL_HOST) ?: config('app.url');

        return $host.'/b/'.$briefing->share_token;
    }

    private function briefingCardSubtitle(Briefing $briefing): string
    {
        if ($briefing->status === Briefing::STATUS_DRAFT) {
            return __('briefings.card_not_shared');
        }

        if ($lastResponseLabel = $this->briefingLastResponseLabel($briefing)) {
            return $lastResponseLabel;
        }

        return __('briefings.card_awaiting_responses');
    }

    private function briefingLastResponseLabel(Briefing $briefing): ?string
    {
        $lastResponseAt = $this->carbonize($briefing->responses_max_submitted_at);
        if (! $lastResponseAt) {
            return null;
        }

        if ($lastResponseAt->isToday()) {
            return __('briefings.card_last_response_today');
        }

        $days = (int) $lastResponseAt->diffInDays(Carbon::now());

        if ($days <= 1) {
            return __('briefings.card_last_response_one_day');
        }

        return __('briefings.card_last_response_days', ['count' => $days]);
    }

    /**
     * @return array{name: string, initials: string}
     */
    private function customerDisplayLabel(?Customer $customer, ?string $respondentName): array
    {
        if ($customer) {
            $name = $customer->org_name
                ?: trim($customer->first_name.' '.$customer->surname)
                ?: '—';

            return [
                'name' => $name,
                'initials' => $this->initialsFromName($name),
            ];
        }

        if ($respondentName) {
            return [
                'name' => $respondentName,
                'initials' => $this->initialsFromName($respondentName),
            ];
        }

        return ['name' => '—', 'initials' => '?'];
    }

    private function initialsFromName(string $name): string
    {
        $parts = preg_split('/\s+/u', trim($name)) ?: [];
        $first = mb_substr($parts[0] ?? '?', 0, 1);
        $second = mb_substr($parts[1] ?? '', 0, 1);

        return strtoupper($first.$second);
    }

    /**
     * @param  array{key: string, label: string}  $quoteStatus
     * @return 'generate'|'edit'|null
     */
    private function responseQuoteAction(array $quoteStatus): ?string
    {
        return match ($quoteStatus['key']) {
            'pending' => 'generate',
            'draft' => 'edit',
            default => null,
        };
    }

    /**
     * @return array{key: string, label: string}
     */
    private function responseQuoteStatus(BriefingResponse $response): array
    {
        if (! $response->offer_id || ! $response->offer) {
            return [
                'key' => 'pending',
                'label' => __('briefings.response_status.pending'),
            ];
        }

        $name = strtolower((string) ($response->offer->statusRelation->name ?? 'draft'));

        return match ($name) {
            'accepted' => ['key' => 'accepted', 'label' => __('briefings.response_status.accepted')],
            'invoiced' => ['key' => 'invoiced', 'label' => __('briefings.response_status.invoiced')],
            'sent', 'pending', 'open' => ['key' => 'sent', 'label' => __('briefings.response_status.sent')],
            'rejected', 'declined' => ['key' => 'declined', 'label' => __('briefings.response_status.declined')],
            default => ['key' => 'draft', 'label' => __('briefings.response_status.draft')],
        };
    }
}
