<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Service;
use App\Models\TimeEntry;
use App\Support\CompanyAccess;
use App\Support\ServiceBilling;
use App\Support\TimeEntryRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TimeEntryController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'time_tracking.access')) {
            return $deny;
        }

        $query = TimeEntry::query()
            ->forCompany($activeCompany->id)
            ->with(['customer', 'service', 'user'])
            ->orderByDesc('started_at');

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('from')) {
            $query->whereDate('started_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('started_at', '<=', $request->date('to'));
        }

        $entries = $query->paginate(25)->withQueryString();

        $hourlyServices = Service::query()
            ->where('company_id', $activeCompany->id)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'billing_mode', 'unit'])
            ->filter(fn (Service $s) => ServiceBilling::isHourly($s))
            ->values();

        $customers = Customer::query()
            ->where('company_id', $activeCompany->id)
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'surname', 'org_name']);

        return Inertia::render('Time/Index', [
            'entries' => $entries,
            'hourlyServices' => $hourlyServices,
            'customers' => $customers,
            'filters' => $request->only(['customer_id', 'status', 'from', 'to']),
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return redirect()->route('companies.index')->with('error', 'Select or create a company first.');
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'time_tracking.create')) {
            return $deny;
        }

        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'customer_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string', 'max:2000'],
            'started_at' => ['required', 'date'],
            'ended_at' => ['required', 'date', 'after:started_at'],
            'billable' => ['sometimes', 'boolean'],
        ]);

        $service = Service::query()
            ->where('company_id', $activeCompany->id)
            ->where('id', $data['service_id'])
            ->firstOrFail();

        TimeEntryRules::assertHourlyServiceForCompany($service, $activeCompany);

        $billable = $request->boolean('billable', true);
        if ($billable && empty($data['customer_id'])) {
            return back()->withErrors(['customer_id' => 'Select a customer for billable time.'])->withInput();
        }

        if (! empty($data['customer_id'])) {
            Customer::query()
                ->where('company_id', $activeCompany->id)
                ->where('id', $data['customer_id'])
                ->firstOrFail();
        }

        $entry = new TimeEntry([
            'company_id' => $activeCompany->id,
            'user_id' => $user->id,
            'customer_id' => $data['customer_id'] ?? null,
            'service_id' => $service->id,
            'description' => $data['description'] ?? null,
            'started_at' => $data['started_at'],
            'ended_at' => $data['ended_at'],
            'billable' => $billable,
            'status' => TimeEntry::STATUS_COMPLETED,
        ]);
        $entry->refreshDurationFromTimestamps();
        $entry->save();

        return redirect()->route('time.index')->with('status', 'time-entry-saved');
    }

    public function update(Request $request, TimeEntry $timeEntry): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany || $timeEntry->company_id !== $activeCompany->id) {
            abort(404);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'time_tracking.create')) {
            return $deny;
        }

        if ($timeEntry->status === TimeEntry::STATUS_INVOICED) {
            return back()->with('error', 'Invoiced time entries cannot be edited.');
        }

        if ($timeEntry->status === TimeEntry::STATUS_RUNNING) {
            return back()->with('error', 'Stop the running timer before editing this entry.');
        }

        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'customer_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string', 'max:2000'],
            'started_at' => ['required', 'date'],
            'ended_at' => ['required', 'date', 'after:started_at'],
            'billable' => ['sometimes', 'boolean'],
        ]);

        $service = Service::query()
            ->where('company_id', $activeCompany->id)
            ->where('id', $data['service_id'])
            ->firstOrFail();

        TimeEntryRules::assertHourlyServiceForCompany($service, $activeCompany);

        $billable = $request->boolean('billable', true);
        if ($billable && empty($data['customer_id'])) {
            return back()->withErrors(['customer_id' => 'Select a customer for billable time.'])->withInput();
        }

        if (! empty($data['customer_id'])) {
            Customer::query()
                ->where('company_id', $activeCompany->id)
                ->where('id', $data['customer_id'])
                ->firstOrFail();
        }

        $timeEntry->fill([
            'customer_id' => $data['customer_id'] ?? null,
            'service_id' => $service->id,
            'description' => $data['description'] ?? null,
            'started_at' => $data['started_at'],
            'ended_at' => $data['ended_at'],
            'billable' => $billable,
        ]);
        $timeEntry->refreshDurationFromTimestamps();
        $timeEntry->save();

        return back()->with('status', 'time-entry-saved');
    }

    public function destroy(Request $request, TimeEntry $timeEntry): RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany || $timeEntry->company_id !== $activeCompany->id) {
            abort(404);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'time_tracking.create')) {
            return $deny;
        }

        if ($timeEntry->status === TimeEntry::STATUS_INVOICED) {
            return back()->with('error', 'Invoiced time entries cannot be deleted.');
        }

        if ($timeEntry->status === TimeEntry::STATUS_RUNNING) {
            return back()->with('error', 'Stop the timer before deleting this entry.');
        }

        $timeEntry->delete();

        return back()->with('status', 'time-entry-deleted');
    }

    public function timerShow(Request $request): JsonResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return response()->json(['running' => null]);
        }

        $entry = $this->runningEntry($user->id, $activeCompany->id);

        return response()->json([
            'running' => $entry ? $this->timerPayload($entry) : null,
        ]);
    }

    public function timerStart(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return response()->json(['message' => 'No active company.'], 422);
        }

        if ($deny = CompanyAccess::denyWrite($user, $activeCompany, false, 'time_tracking.create')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => session('error') ?? 'Not allowed.'], 403);
            }

            return $deny;
        }

        $data = $request->validate([
            'service_id' => ['required', 'integer'],
            'customer_id' => ['nullable', 'integer'],
            'description' => ['nullable', 'string', 'max:2000'],
            'billable' => ['sometimes', 'boolean'],
        ]);

        $service = Service::query()
            ->where('company_id', $activeCompany->id)
            ->where('id', $data['service_id'])
            ->firstOrFail();

        TimeEntryRules::assertHourlyServiceForCompany($service, $activeCompany);

        $billable = $request->boolean('billable', true);
        if ($billable && empty($data['customer_id'])) {
            return response()->json(['message' => 'Select a customer for billable time.'], 422);
        }

        if (! empty($data['customer_id'])) {
            Customer::query()
                ->where('company_id', $activeCompany->id)
                ->where('id', $data['customer_id'])
                ->firstOrFail();
        }

        $entry = DB::transaction(function () use ($user, $activeCompany, $data, $service, $billable) {
            $existing = $this->runningEntry($user->id, $activeCompany->id);
            if ($existing) {
                $this->completeRunningEntry($existing);
            }

            return TimeEntry::create([
                'company_id' => $activeCompany->id,
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                'service_id' => $service->id,
                'description' => $data['description'] ?? null,
                'started_at' => now(),
                'ended_at' => null,
                'duration_seconds' => 0,
                'billable' => $billable,
                'status' => TimeEntry::STATUS_RUNNING,
            ]);
        });

        $entry->load(['service', 'customer']);

        if ($request->expectsJson()) {
            return response()->json(['running' => $this->timerPayload($entry)]);
        }

        return back()->with('status', 'timer-started');
    }

    public function timerStop(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $activeCompany = $user->activeCompany();

        if (! $activeCompany) {
            return response()->json(['message' => 'No active company.'], 422);
        }

        $entry = $this->runningEntry($user->id, $activeCompany->id);
        if (! $entry) {
            return response()->json(['message' => 'No running timer.'], 422);
        }

        $this->completeRunningEntry($entry);
        $entry->load(['service', 'customer']);

        if ($request->expectsJson()) {
            return response()->json(['running' => null, 'entry' => $this->timerPayload($entry)]);
        }

        return back()->with('status', 'timer-stopped');
    }

    private function runningEntry(int $userId, int $companyId): ?TimeEntry
    {
        return TimeEntry::query()
            ->where('user_id', $userId)
            ->where('company_id', $companyId)
            ->where('status', TimeEntry::STATUS_RUNNING)
            ->with(['service', 'customer'])
            ->first();
    }

    private function completeRunningEntry(TimeEntry $entry): void
    {
        $entry->ended_at = now();
        $entry->refreshDurationFromTimestamps();
        $entry->status = TimeEntry::STATUS_COMPLETED;
        $entry->save();
    }

    /**
     * @return array<string, mixed>
     */
    private function timerPayload(TimeEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'started_at' => $entry->started_at?->toIso8601String(),
            'duration_seconds' => $entry->duration_seconds,
            'description' => $entry->description,
            'service' => $entry->service ? [
                'id' => $entry->service->id,
                'name' => $entry->service->name,
            ] : null,
            'customer' => $entry->customer ? [
                'id' => $entry->customer->id,
                'label' => trim($entry->customer->org_name ?: ($entry->customer->first_name.' '.$entry->customer->surname)),
            ] : null,
        ];
    }
}
