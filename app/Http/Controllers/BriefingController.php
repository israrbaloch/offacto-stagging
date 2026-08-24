<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateBriefingRequest;
use App\Models\Briefing;
use App\Models\BriefingQuestion;
use App\Models\Customer;
use App\Models\Service;
use App\Support\CompanyAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            'questionTypes' => BriefingQuestion::types(),
            'shareUrl' => $briefing->publicUrl(),
        ]);
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
            ->with(['offer.statusRelation', 'customer'])
            ->latest('submitted_at')
            ->get();

        return Inertia::render('Briefings/Responses', [
            'briefing' => $briefing,
            'responses' => $responses,
        ]);
    }
}
