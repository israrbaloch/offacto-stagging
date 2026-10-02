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
            ->paginate(15);

        return Inertia::render('Briefings/Index', [
            'briefings' => $briefings,
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        if ($deny = CompanyAccess::denyWrite($request->user(), $company)) {
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

        $briefing->load(['questions.service', 'customer']);

        $customers = Customer::where('company_id', $company->id)
            ->orderBy('first_name')
            ->get()
            ->mapWithKeys(fn ($customer) => [
                $customer->id => trim($customer->first_name.' '.$customer->surname).($customer->org_name ? ' ('.$customer->org_name.')' : ''),
            ]);

        $services = Service::where('company_id', $company->id)
            ->orderBy('name')
            ->get(['id', 'name', 'price']);

        return Inertia::render('Briefings/Edit', [
            'briefing' => $briefing,
            'customers' => $customers,
            'services' => $services,
            'questionTypes' => collect(BriefingQuestion::types())->mapWithKeys(
                fn (string $label, string $key) => [$key => __('briefings.question_type.'.$key)]
            ),
            'shareUrl' => $briefing->publicUrl(),
        ]);
    }

    public function duplicate(Request $request, Briefing $briefing): RedirectResponse
    {
        $company = $request->user()->activeCompany();
        if (! $company || $briefing->company_id !== $company->id) {
            abort(403);
        }

        if ($deny = CompanyAccess::denyWrite($request->user(), $company)) {
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
            'email' => ['required', 'email', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        Mail::to($data['email'])->send(new BriefingShareMail(
            $briefing,
            $briefing->publicUrl(),
            $data['message'] ?? null,
        ));

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
            'intro' => $data['intro'] ?? null,
            'customer_id' => $data['customer_id'] ?? null,
            'auto_generate_offer' => $data['auto_generate_offer'] ?? $briefing->auto_generate_offer,
            'valid_until_days' => $data['valid_until_days'] ?? $briefing->valid_until_days,
            'status' => $data['status'] ?? $briefing->status,
        ]);

        $keepIds = [];
        foreach ($data['questions'] ?? [] as $index => $row) {
            $payload = [
                'sort_order' => $index,
                'type' => $row['type'],
                'label' => $row['label'],
                'help_text' => $row['help_text'] ?? null,
                'required' => (bool) ($row['required'] ?? false),
                'service_id' => $row['service_id'] ?? null,
                'price_override' => $row['price_override'] ?? null,
                'options' => $row['options'] ?? [],
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
            ->map(fn (BriefingResponse $response) => [
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
                'quote_status' => $this->responseQuoteStatus($response),
            ]);

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

        if ($deny = CompanyAccess::denyWrite($request->user(), $company)) {
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
